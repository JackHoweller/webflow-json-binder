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
                        switch ($(childElement).prop('tagName').toLowerCase()) {
                            case 'input': $(childElement).val(childValue); break;
                            case 'img': $(childElement).attr('src', childValue); break;
                            case 'a': $(childElement).attr('href', childValue); break;
                            default: $(childElement).text(childValue);
                        }
                    });
                } else {
                    clonedElement = $(element).clone();
                    switch (clonedElement.prop('tagName').toLowerCase()) {
                        case 'input': clonedElement.val(item); break;
                        case 'img': clonedElement.attr('src', item); break;
                        case 'a': clonedElement.attr('href', item); break;
                        default: clonedElement.text(item);
                    }
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

function createNestedProxies(obj, tableName, rootProperty, childProperty, callback) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = createNestedProxies(obj[key], tableName, rootProperty, childProperty, callback);
            obj[key] = new Proxy(obj[key], {
                set(target, property, value) {
                    target[property] = value;
                    populateDOMElements(tableName, rootProperty, childProperty);
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                    return true;
                },
            });
        }
    }
    return obj;
}

function bindData(data, tableName, rootProperty, childProperty, callback) {
    const handler = {
        set(target, property, value) {
            target[property] = value;
            populateDOMElements(tableName, rootProperty, childProperty);
            if (callback && typeof callback === 'function') {
                callback();
            }
            return true;
        },
    };

    window[tableName] = new Proxy(createNestedProxies(data, tableName, rootProperty, childProperty, callback), handler);
    populateDOMElements(tableName, rootProperty, childProperty);
}
