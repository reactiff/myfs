import chalk from "chalk";
import logTrack from "utils/logTrack.mjs";
import toDictionary from "utils/toDictionary.mjs";

let EVENT_COUNT = 0;

export default class EventManager {

  target;
  topics = {};
  counts = {};

  allowDynamicTopics;

  constructor(target, topicNames, handlers) {
    this.target = target;
    this.topics = toDictionary(
      topicNames, 
      (k) => k, 
      () => [].slice()
    );
    this.counts = toDictionary(
      topicNames, 
      (k) => k, 
      () => 0
    );
        
    this.allowDynamicTopics = Reflect.has(this.topics, '*');

    // bind event handlers supplied
    Object.keys(handlers)
      // .filter(k => Reflect.has(this.topics, k))
      .forEach(k => this.subscribe(k, handlers[k]))
  }

  getSubs(topic) {
    let arr;

    const isLocal = this.allowDynamicTopics || Reflect.has(this.topics, topic);

    if (isLocal) {
      arr = this.topics[topic];
    } 
    else {
      arr = (this.target.topics || {})[topic];
    }
   
    return arr;
  }

  createDynamicTopic(topic) {
    this.topics[topic] = [].slice();
    this.counts[topic] = 0;
    return this.topics[topic];
  }

  topicExists(topic) {
    return Reflect.has(this.topics, topic) 
      || Reflect.has((this.target.topics || {}), topic);
  }

  isValidTopic(topic) {
    const isLocalTopic = Reflect.has(this.topics, topic) || Reflect.has(this.topics, '*');
    const isTargetTopic = this.target 
      && this.target.topics 
      && (
        Reflect.has(this.target.topics, topic) 
        || 
        Reflect.has(this.target.topics, '*')
      );
    return isLocalTopic || isTargetTopic;
  }

  findSubscriptionIndex(topic, callback) {
    return this.getSubs(topic).findIndex(cb => cb === callback); 
  }

  subscribe(topic, callback) {
    if (!this.isValidTopic(topic)) {
      debugger // topic not found
    }

    if (!this.topicExists(topic) && this.allowDynamicTopics) {
      // create dynamic topic
      this.createDynamicTopic(topic);
    }
    const subIndex = this.findSubscriptionIndex(topic, callback);
    if (subIndex >= 0) return; // exit silently
    this.topics[topic].push(callback);
  }

  unsubscribe(topic, callback) {
    if (!this.isValidTopic(topic)) {
      debugger // topic not found
    }
    const subIndex = this.findSubscriptionIndex(topic, callback);
    if (subIndex < 0) return; // exit silently
    this.topics[topic].splice(subIndex, 1);
  }

  getTargetName() {
    let targetName;
    if (this.target.getName) {
      targetName = this.target.getName();
    }
    else {
      if (!this.target.constructor) throw new Error('Target is not even a class...');
      targetName = this.target.constructor.name; 
    }
    return targetName;
  }

  notify(topic, data) {
    const targetName = this.getTargetName();
    const subs = this.getSubs(topic);
    
    if (!subs) {
      logTrack('EventManager', `topic ${topic} not found`);
    }

    const eventId = ++EVENT_COUNT;


    const validCallbacks = subs.filter(cb => typeof cb === 'function');

    if (validCallbacks.length > 0) {
      logTrack(targetName, chalk.gray.italic(targetName + '::' + topic + ` {${eventId}}` + ' (call back ' + validCallbacks.length + ' subscribers)')); 
      validCallbacks.forEach(callback => {
        if (typeof callback === 'function') {
          callback({ 
            topic,
            target: this.target,
            data,
            id: eventId,
          })
        }
      });
    }
    else {
      // log it subtly in gray italic
      logTrack(targetName, chalk.gray.italic(targetName + '::' + topic)); 
    }

    this.counts[topic]++;
  }

  static implementFor(obj, eventNames, events) {
    const h = events || {};
    const em = new EventManager(obj, eventNames, h);
    em.target = obj;
    obj.eventManager = em;
    obj.notify = (topic, ...args) => em.notify(topic, ...args);
    obj.subscribe = (topic, callback) => em.subscribe(topic, callback);
    obj.unsubscribe = (topic, callback) => em.unsubscribe(topic, callback);
    obj.getNotifyCount = (topic) => em.counts[topic];
  }
}