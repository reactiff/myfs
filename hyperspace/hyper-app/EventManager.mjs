import toDictionary from "utils/toDictionary.mjs";

export default class EventManager {

  topics = {};

  constructor(topicNames, handlers) {
    this.topics = toDictionary(
      topicNames, 
      k => k, 
      []
    );
    
    // bind event handlers supplied
    Object.keys(handlers)
      .filter(k => Reflect.has(this.topics, k))
      .forEach(k => this.subscribe(k, handlers[k]))
  }

  findSubscriptionIndex(topic, callback) {
    return this.topics[topic].findIndex(cb => cb === callback); 
  }

  subscribe(topic, callback) {
    if (!Reflect.has(this.topics, topic)) throw new Error(`Invalid topic: ${topic}`);
    const subIndex = this.findSubscriptionIndex(topic, callback);
    if (subIndex >= 0) return; // exit silently
    this.topics[topic].push(callback);
  }

  unsubscribe(topic, callback) {
    if (!Reflect.has(this.topics, topic)) throw new Error(`Invalid topic: ${topic}`);
    const subIndex = this.findSubscriptionIndex(topic, callback);
    if (subIndex < 0) return; // exit silently
    this.topics[topic].splice(subIndex, 1);
  }

  notify(topic, ...args) {
    if (!Reflect.has(this.topics, topic)) throw new Error(`Invalid topic: ${topic}`)
    this.topics[topic].forEach(callback => callback(...args));
  }

  static implementFor(obj, topicNames, ...handlers) {
    const eh = handlers || [];
    const h = Object.assign({}, ...eh);
    const em = new EventManager(topicNames, h);
    obj.eventManager = em;

    /** Private.  DO NOT USE. */
    function notify(topic, ...args) { em.notify(topic, ...args) }
    obj.notify = notify;

    obj.subscribe = (topic, callback) => em.subscribe(topic, this.callback);
    obj.unsubscribe = (topic, callback) => em.unsubscribe(topic, this.callback);
  }
}