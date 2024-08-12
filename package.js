$(document).ready(() => {
  startSkeleton()
  loadToast()
  backstopCSRF()
});

function loadToast() {
  const scriptSrc = "https://cdn.jsdelivr.net/gh/jackhoweller/webflow-json-binder@latest/toast.js";
  const $script = $("<script>").attr("src", scriptSrc);
  $("body").append($script);
};

window.startSkeleton = function() {
  $('[skeleton-load]').each((index, element) => {
    $(element).css('position', 'relative').append('<div class="skeleton-loader"></div>');
  });
}

window.removeSkeleton = function() {
  setTimeout(() => {
    $('.skeleton-loader').css("opacity", 0)
    setTimeout(() => {
      $('.skeleton-loader').remove();
    }, 400);
  }, 300);
}

function backstopCSRF() {
  setTimeout(() => {
    const refreshCount = parseInt(sessionStorage.getItem('refreshCount')) || 0;
    
    if ($('.skeleton-loader').length > 0 && refreshCount < 2) {
      sessionStorage.setItem('refreshCount', (refreshCount + 1).toString());
      location.reload();
    } else {
      sessionStorage.removeItem('refreshCount');
    }
  }, 5000);
};

function findObjectByUUID(obj, uuid) {
  if (obj.uuid === uuid) {
    return obj;
  }
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const result = findObjectByUUID(obj[key], uuid);
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
}

const createdElements = {};

function updateElement(data, element) {
    let newData = data

    if (/^\d{13}$/.test(newData)) {
      newData = new Date(newData).toLocaleDateString('en-GB')
    }
    const tagName = element.prop('tagName').toLowerCase();
    switch (tagName) {
        case 'input':
        case 'select':
        case 'textarea':
            element.val(newData).trigger("input");
            break;
        case 'img':
            element.attr('src', newData);
            break;
        case 'a':
            element.attr('href', newData);
            break;
        default:
            element.text(newData);
    }
}

function populateDOMElements (tableName, rootProperty, childProperty) {
    if (!createdElements[tableName]) {
        createdElements[tableName] = [];
    }
    createdElements[tableName].forEach((createdElement) => {
        createdElement.remove();
    });
    createdElements[tableName].length = 0;
    $(`[${rootProperty}]`).each((index, element) => {
        const root = $(element).attr(rootProperty);
        const value = getNestedValue(window[tableName], root);
        if (Array.isArray(value)) {
            const originalElement = $(element);
            if (typeof value[0] === 'object' || value.length == 0) {
                originalElement.hide();
            } else {
                originalElement.empty()
            }
            value.forEach((arrayItem) => {
                let clonedElement
                if (typeof arrayItem === 'object') {
                    clonedElement = originalElement.clone();
                    clonedElement.removeAttr(rootProperty);
                    clonedElement.show();
                    originalElement.after(clonedElement);
                    $(`[${childProperty}]`, clonedElement).each((childIndex, childElement) => {
                        const childKey = $(childElement).attr(childProperty);
                        const childValue = getNestedValue(arrayItem, childKey);
                        updateElement(childValue, $(childElement))
                    });
                    childVisibilityOnDOM (clonedElement, arrayItem, childProperty)
                } else {
                    clonedElement = $(element).clone();
                    updateElement(arrayItem, clonedElement)
                    $(element).after(clonedElement);
                }
                createdElements[tableName].push(clonedElement);
            });
        } else {
            updateElement(value, $(element))
        }
    });
    rootVisibilityOnDOM(tableName, rootProperty, childProperty);
}

function evaluateComparison(operator, comparative, valueToCompare) {
    if (comparative.trim() !== '' && comparative.toLowerCase().includes('true')) {
        comparative = true;
    }
    else if (comparative.trim() !== '' && comparative.toLowerCase().includes('false')) {
        comparative = false;
    }
  
    switch (operator) {
        case '==': return valueToCompare == comparative;
        case '!==': return valueToCompare !== comparative;
        case '>': return valueToCompare > comparative;
        case '<': return valueToCompare < comparative;
        default: return false;
    }
}

function rootVisibilityOnDOM(tableName, rootProperty) {
    $(`[${rootProperty}-visibility]`).each((index, element) => {
        const formula = $(element).attr(`${rootProperty}-visibility`).split(/(===|!==|==|<|>)/);
        let comparative = formula [2]
        let valueToCompare = getNestedValue(window[tableName], formula[0]);
        $(element).toggle(evaluateComparison(formula [1], comparative, valueToCompare))
        $(element).css('opacity', + evaluateComparison(formula [1], comparative, valueToCompare))
    });
}

function childVisibilityOnDOM(parent, arrayItem, childProperty) {
    $(parent).find('*').each((index, element) => {
        const formula = $(element).attr(`${childProperty}-visibility`);
        if (formula) {
            const parts = formula.split(/(===|!==|==|<|>)/);
            let comparative = parts[2];
            let valueToCompare = getNestedValue(arrayItem, parts[0]);
            $(element).toggle(evaluateComparison(parts[1], comparative, valueToCompare));
            $(element).css('opacity', + evaluateComparison(parts[1], comparative, valueToCompare));
        }
    });
}

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
                        debounce(callback);
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
                debounce(callback);
            }
            return true;
        },
    };

    window[tableName] = new Proxy(createNestedProxies(data, tableName, rootProperty, childProperty, callback), handler);
    populateDOMElements(tableName, rootProperty, childProperty);
    removeSkeleton();
}

let isFirstRequest = true;

function debounce(callback) {
    if (isFirstRequest) {
        isFirstRequest = false
        callback()
        setTimeout(() => {
            isFirstRequest = true
        }, 1000)
    }
    else {
        setTimeout(() => {
            isFirstRequest = true
        }, 1000)
    }
}

function getFormData(formId) {
  const formData = {};
  const form = $(`#${formId}`);
  
  form.find(':input').each(function() {
    const input = $(this);
    const name = input.attr('name');
    const value = input.val();
    
    if (input.is(':checkbox')) {
      formData[name] = input.is(':checked');
    } else if (input.is('select[multiple]')) {
      formData[name] = input.find('option:selected').map(function() {
        return $(this).val();
      }).get();
    } else {
      formData[name] = value;
    }
  });
  
  return formData;
}

function generateGradientArray(startColor, endColor, length) {
  const startRGB = hexToRgb(startColor);
  const endRGB = hexToRgb(endColor);

  const stepSize = {
    r: (endRGB.r - startRGB.r) / (length - 1),
    g: (endRGB.g - startRGB.g) / (length - 1),
    b: (endRGB.b - startRGB.b) / (length - 1)
  };

  const gradientArray = [];
  for (let i = 0; i < length; i++) {
    const r = Math.round(startRGB.r + stepSize.r * i);
    const g = Math.round(startRGB.g + stepSize.g * i);
    const b = Math.round(startRGB.b + stepSize.b * i);
    const hex = rgbToHex(r, g, b);
    gradientArray.push(hex);
  }
  
  return gradientArray;
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
