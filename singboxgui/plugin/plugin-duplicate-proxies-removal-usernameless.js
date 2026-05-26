export default (Plugin) => {
    let count = 0


    return {

        async onSubscribe(proxies, subscription) {
            let addIndex = Plugin.addIndex;
            let noAddIndex = Plugin.noAddIndex;
            let removeMap = Plugin.removeKeywords;
            let subsName = subscription.name
            let isSingBox = Plugins.APP_TITLE.includes("SingBox");
            let isClash = Plugins.APP_TITLE.includes("Clash");

            let seenEndpoints = new Set();
            let uniqueProxies = [];
            let removedProxies = [];

            // 1. Identify and separate unique vs. duplicate proxies.
            for (let proxy of proxies) {
                let endpoint = `${proxy.server}:${proxy.server_port || proxy.port}`;
                if (seenEndpoints.has(endpoint)) {
                    removedProxies.push(proxy);
                } else {
                    seenEndpoints.add(endpoint);
                    uniqueProxies.push(proxy);
                }
            }

            // 2. Notify the user about which duplicate proxies were removed.
            if (removedProxies.length > 0) {
                let removedProxyNames = removedProxies
                    .map((proxy) => {
                        if (isSingBox) return proxy.tag;
                        if (isClash) return proxy.name;
                        return proxy.name || proxy.tag || "Unknown Proxy";
                    })
                    .join(", ");

                let message = `溢出了 ${removedProxies.length} 个重复节点: ${removedProxyNames}`;
                Plugins.message.success(message);
            }

            // 3. Apply the original renaming logic to the now-unique list of proxies.
            let processedProxies;
            processedProxies = uniqueProxies;
            if (isSingBox && addIndex.includes(subsName)) {
                processedProxies = uniqueProxies.map((proxy, i) => ({
                    ...proxy, tag: `${proxy.tag}_${i + 1}`,
                }));
            } else if (isClash && addIndex.includes(subsName)) {
                processedProxies = uniqueProxies.map((proxy, i) => ({
                    ...proxy, name: `${proxy.name}_${i + 1}`,
                }));
            }

            if (removeMap) {
                processedProxies = removeKeywords(subsName, removeMap, processedProxies);
            }

            return processedProxies;
        },


    }


}

const removeKeywords = (subscriptionName, removeKeywords, proxies) => {
    let removedProxies = proxies;
    console.dir(removeKeywords)
    for (const [key, value] of Object.entries(removeKeywords)) {
        let subscName, removeStr;
        subscName = key
        // 暂时保留，防止UI配置的关键字分隔符变化
        removeStr = value.split("|");
        const regex = new RegExp(removeStr.join('|'), 'g');
        if (subscName === subscriptionName) {
            console.log("subscName === subscriptionName === ", subscName)

            removedProxies = proxies.map((proxy, i) => ({
                ...proxy, tag: `${proxy.tag.replace(regex, "")}`,
            }));
        }
    }

    return removedProxies

}

