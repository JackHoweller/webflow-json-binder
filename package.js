//Json data auto-populates in DOM
const createdElements = [];

const populateDOMElements = (rootProperty, childProperty) => {
    createdElements.forEach((createdElement) => {
        createdElement.remove();
    });
    createdElements.length = 0;

    $('[xano-root]').each((index, element) => {
        const root = $(element).attr(rootProperty);
        const value = getNestedValue(window.xanoData, root);

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

// Function to get nested values from JSON
function getNestedValue(obj, keys) {
    const path = keys.split('.');
    try {
        return path.reduce((result, key) => result[key], obj);
    } catch (e) {
        return "Couldn't find path";
    }
}

// Function to create proxies for nested objects recursively
function createNestedProxies(obj, rootProperty, childProperty) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = createNestedProxies(obj[key]);
            obj[key] = new Proxy(obj[key], {
                set(target, property, value) {
                    target[property] = value;
                    populateDOMElements(rootProperty, childProperty);
                    return true;
                }
            });
        }
    }
    return obj;
}

//Function to trigger proxies from data
function bindData(data, tableName, rootProperty, childProperty) {
    window[tableName] = new Proxy(createNestedProxies(data, rootProperty, childProperty), {
        set(target, property, value) {
            target[property] = value;
            populateDOMElements(rootProperty, childProperty);
            return true;
        }
    });
    //First pass of populating DOM
    populateDOMElements(rootProperty, childProperty)
}
