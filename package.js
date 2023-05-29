const createdElements = [];

const populateDOMElements = (tableName, rootProperty, childProperty) => {
    createdElements.forEach((createdElement) => {
        createdElement.remove();
    });
    createdElements.length = 0;
    $(`[${rootProperty}]`).each((index, element) => {
        const root = $(element).attr(rootProperty);
        const value = getNestedValue(window[tableName], root);
        if (Array.isArray(value)) {
            const originalElement = $(element);
            if (typeof value[0] === 'object') {
                originalElement.hide();
            } else {
                originalElement.empty()
            }
            value.forEach((item) => {
                let clonedElement
                if (typeof item === 'object') {
                    clonedElement = originalElement.clone();
                    clonedElement.removeAttr(rootProperty);
                    clonedElement.show();
                    originalElement.after(clonedElement);

                    $(`[${childProperty}]`, clonedElement).each((childIndex, childElement) => {
                        const childKey = $(childElement).attr(childProperty);
                        const childValue = getNestedValue(item, childKey);
                        $(childElement).text(childValue);
                    });
                } else {
                    clonedElement = $(element).clone();
                    clonedElement.text(item);
                    $(element).after(clonedElement);
                }
                createdElements.push(clonedElement);
            });
        } else {
            $(element).text(value);
        }
    });
};

function getNestedValue(obj, keys) {
    const path = keys.split('.');
    try {
        return path.reduce((result, key) => result[key], obj);
    } catch (e) {
        return "Couldn't find path";
    }
}

function createNestedProxies(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = createNestedProxies(obj[key]);
            obj[key] = new Proxy(obj[key], {
                set(target, property, value) {
                    target[property] = value;
                    populateDOMElements("xanoData", "xano-root", "xano-child");
                    return true;
                },
            });
        }
    }
    return obj;
}

function bindData(data, tableName, rootProperty, childProperty) {
    window[tableName] = new Proxy(
        createNestedProxies(data),
        {
            set(target, property, value) {
                target[property] = value;
                populateDOMElements(tableName, rootProperty, childProperty);
                return true;
            },
        }
    );
    populateDOMElements(tableName, rootProperty, childProperty);
}
