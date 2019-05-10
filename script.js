
// BUDGET CONTROLLER
var budgetController = (function() {

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.precentage = -1;
    };

    Expense.prototype.calcPrecentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.precentage = Math.round((this.value / totalIncome) * 100);
        }
        else this.precentage = -1;
    };

    Expense.prototype.getPrecentage = function() {
        return this.precentage;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        precentage: -1
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        for(var i = 0; i < data.allItems[type].length; i++) {
            sum += data.allItems[type][i].value;
        }
        data.totals[type] = sum;
    };

    return {

        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'inc') {
                newItem = new Income(ID, des, val); 
            }
            else if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element 
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids = [], index;

            for(var i = 0; i < data.allItems[type].length; i++) {
                ids[i] = data.allItems[type][i].id;
            }

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // Calaculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the precentage of income that we spent
            if (data.totals.inc > 0) {
                data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else data.precentage = -1;
            
        },

        calculatePrecentegaes: function() {
            for(var i = 0; i < data.allItems.exp.length; i++) {
                data.allItems.exp[i].calcPrecentage(data.totals.inc);
            }
        },

        getPrecentage: function() {
            var allPerc = [];
            for(var i = 0; i < data.allItems.exp.length; i++) {
                allPerc[i] = data.allItems.exp[i].getPrecentage();
            }
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                precentage: data.precentage
            }
        },

        testing: function() {
            return data;
        }

    };

})();

// UI CONTROLLER
var UIController = (function() {
    var DOMstrings = {
        inputType: '.new-type',
        inputDescription: '.new-description',
        inputValue: '.new-value',
        inputBtn: '.new-btn',
        incomeContainer: '.income-list',
        expenseContainer: '.expense-list',
        budgetLabel: '.display-value',
        incomeLabel: '.budget-income-value',
        expenseLabel: '.budget-expense-value',
        precentageLabel: '.budget-expense-percentage',
        bottom: '.bottom',
        trashIcon: '.fa-trash-alt',
        deleteBtn: '.delete-btn',
        expensesPrecLabel: '.item-percentage',
        dateLabel: '.display-date'

    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        if(type === 'inc') type = '+';
        else type = '-';
    
        return  int + '.' + dec + ' ' + type;
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        getDOMstrings: function() {
            return DOMstrings
        },

        addListItem: function(obj, type) {
            var html, newHtml, element

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="delete-btn"><i class="fas fa-trash-alt"></i></div><div class="item-description">%description%</div><div class="item-value">%value%</div></div>';
            }
            else if(type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="delete-btn"><i class="fas fa-trash-alt"></i></div><div class="item-percentage">21%</div><div class="item-description">%description%</div><div class="item-value">%value%</div></div>';
            }
            
            // Replace the placeholder text with the data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            for(var i = 0; i < fields.length; i++) {
                fields[i].value = "";
            }

            fields[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            if(obj.budget > 0) {
                type = 'inc';
            } 
            else type = 'exp'

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.precentage > 0) {
                document.querySelector(DOMstrings.precentageLabel).textContent = obj.precentage + '%';
            }
            else {
                document.querySelector(DOMstrings.precentageLabel).textContent = '---';
            }
        },
 
        displayPrecentegaes: function(precentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPrecLabel);
            
            for(var i = 0; i < fields.length; i++) {
                if(precentages[i] > 0) {
                    fields[i].textContent = precentages[i] + '%';
                }
                else {
                    fields[i].textContent = '---';
                }
            }
        },

        displayDate: function() {
            var months, month, year;

            now = new Date();

            months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year
        },

        changeType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            for(var i = 0; i < fields.length; i++) {
                fields[i].classList.toggle('red-focus');
            }

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    };

})();

// APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var DOM = UICtrl.getDOMstrings();

    var setupEventListeners = function() {

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if (event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.bottom).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePrecentages = function() {

        // 1. Calculate precentages
        budgetCtrl.calculatePrecentegaes();

        // 2. Read precentages from budget controller
        var precentages = budgetCtrl.getPrecentage();

        // 3. Update the UI with the new precentages 
        UICtrl.displayPrecentegaes(precentages);
    };
   
    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Claculate and update precentages
            updatePrecentages();
        } 
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID, icons, btns;

        icons = document.querySelectorAll(DOM.trashIcon);
        btns = document.querySelectorAll(DOM.deleteBtn);

        for(var i = 0; i < icons.length; i++) {
            if (event.target === icons[i]) {
                itemID = event.target.parentNode.parentNode.id;   
            }
            else if (event.target === btns[i]) {
                itemID = event.target.parentNode.id;
            }
        }  

        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // 1. Delete the item from the budget controller 
        budgetCtrl.deleteItem(type, ID)

        // 2. Delete the item from the UI
        UICtrl.deleteListItem(itemID);

        // 3. Update and show the new budget
        updateBudget();

        // 4. Claculate and update precentages
        updatePrecentages();
    };

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayDate();
        }
    };
    
})(budgetController, UIController);

controller.init();