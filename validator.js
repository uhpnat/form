function Validator(options) {
    function getParent(element,selector){
         while (element.parentElement) {
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element=element.parentElement
         }

    }
    var selectorRules = {}
    // ham thực hiện validate 
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)

        // value : inputElement.value
        //test function : rule.test
        var errorMessage
        var rules = selectorRules[rule.selector]
        //lấy ra các rules của selector
        //lặp qua tung rules va kiem tra
        //nau co loi thi dung viec kiem tra
        for (var i = 0; i < rules.length; ++i) {
            
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break;
        }
        // console.log(rules)
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid')

        }
        return !errorMessage;


    }
    //lấy elament form cần validate
    var formElement = document.querySelector(options.form)
    if (formElement) {

        //lap qua moi rule va xu ly ( lang nghe su kien)
        // bị lỗi không sử dụng dươc ==== đã fix
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;


            //lap qua tung rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })


            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var forrmValues = Array.from(enableInputs).reduce(function (values, input) {
                        values[input.name] = input.value
                        return  values;
                    }, {});
                    options.onSubmit(forrmValues);
                }
                //submit vơi hanh vi mac dinh
                else{
                    formElement.submit();
                }
            }
        }


        options.rules.forEach(function (rule) {
            // lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            // selectorRules[rule.selector] =rule.test;
            var inputElement = formElement.querySelector(rule.selector);


            if (inputElement) {
                //xử lý blur ra ngoai
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }
                //xu ly khi người dùng đang nhập
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector('.form-message')
                    errorElement.innerText = ''
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }
            }
        });
        // console.log(selectorRules)
    }
}
// định nghĩa rules
// nguyen tắc của các rules
// khi co lỗi trả ra message lỗi
// lkhi hợp lệ ==> khong tra gì ca 
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        },
    }
}
Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là Email'
        },
    }
}
Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : 'Vui long nhập tối thiểu ${min} kí tự'
        },
    }
}
Validator.isConfirmation = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'

        }
    };
}