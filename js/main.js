let questions = {}; // Объявляем переменную для хранения вопросов

fetch('questions.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Сеть не в порядке');
        }
        return response.json();
    })
    .then(data => {
        questions = data; // Присваиваем загруженные вопросы переменной
        clearPage();
        showTestSelection(); // Отображаем выбор теста
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });

// 1. Находим элементы
const headerContainer = document.querySelector('#header');
const listContainer = document.querySelector('#list');
const submitBtn = document.querySelector('#submit');

// 2. Переменные игры
let score = 0; // рекорд
let questionIndex = 0; // индекс вопроса
let selectedTest = ''; // выбранный тест

// 3. Очистить страницу
function clearPage() {
    headerContainer.innerHTML = '';
    listContainer.innerHTML = '';
}

// 4. Отображение выбора теста
function showTestSelection() {
    const testKeys = Object.keys(questions);
    const testButtons = testKeys.map(test =>
        `<button class="test-button" onclick="startTest('${test}')">${test}</button>`
    ).join('');

    headerContainer.innerHTML = `<h2 class="title">Выберите тест</h2>${testButtons}`;
}

// 5. Начать тест
function startTest(test) {
    selectedTest = test;
    questionIndex = 0; // Сброс индекса вопросов
    score = 0; // Сброс счётчика
    clearPage();
    showQuestion();
    submitBtn.onclick = checkAnswer;
}

// 6. Отрисовать вопрос
function showQuestion() {
    const currentQuestions = questions[selectedTest]; // Получаем вопросы для выбранного теста

    // Проверка, есть ли вопросы
    if (!currentQuestions || currentQuestions.length === 0) {
        headerContainer.innerHTML = '<h2 class="title">Нет доступных вопросов</h2>';
        return;
    }

    showRemaining(currentQuestions);

    // Создать шаблон вопроса, метка %title%
    const headerTemplate = `<h2 class="title">%title%</h2>`;
    const title = headerTemplate.replace('%title%', currentQuestions[questionIndex]['question']);
    headerContainer.innerHTML = title;

    // Обходить массив через цикл
    listContainer.innerHTML = ''; // Очистить предыдущие ответы
    let answerNumber = 1;
    for (const answerText of currentQuestions[questionIndex]['answers']) {
        const questionTemplate =
            `<li>
                <label>
                    <input value="%number%" type="radio" class="answer" name="answer" />
                    <span>%answer%</span>
                </label>
            </li>`;
        const answerHTML = questionTemplate
            .replace('%answer%', answerText)
            .replace('%number%', answerNumber);

        listContainer.innerHTML += answerHTML;
        answerNumber++;
    }
}

// Функция для отображения оставшихся вопросов
function showRemaining(currentQuestions) {
    const remainingQuestions = currentQuestions.length - questionIndex; // Общее количество оставшихся вопросов
    if (remainingQuestions === 1) {
        document.querySelector('#remaining').innerText = `Это последний вопрос!`;
    } else {
        document.querySelector('#remaining').innerText = `Осталось вопросов: ${remainingQuestions}`;
    }
}

// 7. Проверка клика по кнопке
function checkAnswer() {
    const currentQuestions = questions[selectedTest]; // Получаем вопросы для выбранного теста
    // Находим выбранную радиокнопку
    const checkedRadio = listContainer.querySelector('input[type="radio"]:checked');
    // Была-ли найдена выбранная радиокнопка 
    if (!checkedRadio) {
        // Сделать расфокус для кнопки
        submitBtn.blur();
        return;
    }
    // Узнаем номер ответа пользователя
    const userAnswer = parseInt(checkedRadio.value);
    // Проверяем верность ответа по свойству correct 
    if (userAnswer === currentQuestions[questionIndex]['correct']) {
        score++;
    }

    // Проверка, это был последний вопрос или нет
    if (questionIndex !== currentQuestions.length - 1) {
        questionIndex++;
        clearPage();
        showQuestion();
        return;
    } else {
        clearPage();
        showResults(currentQuestions.length);
    }
}

function showResults(totalQuestions) {
    const resultsTemplate = `
    <h2 class="title">%title%</h2>
      <h3 class="summary">%message%</h3>
      <p class="result">%result%</p>
    `;

    let title, message;
    // Варианты заголовков и текста
    if (score === totalQuestions) {
        title = 'Поздравляем!';
        message = 'Вы ответили верно на все вопросы!';
    } else if ((score * 100) / totalQuestions >= 50) {
        title = 'Неплохой результат!';
        message = 'Вы дали более половины правильных ответов';
    } else {
        title = 'Стоит постараться';
        message = 'Пока у вас меньше половины правильных ответов';
    }

    // Результат 
    let result = `${score} из ${totalQuestions}`;

    // Финальный ответ, подставляем данные в шаблон 
    const finalMessage = resultsTemplate
        .replace('%title%', title)
        .replace('%message%', message)
        .replace('%result%', result);

    headerContainer.innerHTML = finalMessage;

    // Меняем кнопку на "Играть снова"
    submitBtn.innerText = 'Начать заново';
    submitBtn.onclick = function () {
        // Обновление страницы
        history.go();
    };
}

