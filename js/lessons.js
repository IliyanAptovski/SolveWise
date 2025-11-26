// Interactive Lessons Management
class LessonsManager {
    constructor() {
        this.currentLesson = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Lesson card clicks
        document.querySelectorAll('.start-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const lessonCard = e.target.closest('.lesson-card');
                const lessonType = lessonCard.getAttribute('data-lesson');
                this.startLesson(lessonType);
            });
        });

        // Back button
        document.getElementById('backToLessons').addEventListener('click', () => {
            this.showLessonList();
        });
    }

    startLesson(lessonType) {
        this.currentLesson = lessonType;
        this.showLessonContainer();
        this.loadLessonContent(lessonType);
    }

    showLessonContainer() {
        document.querySelector('.lessons-grid').style.display = 'none';
        document.getElementById('lessonContainer').style.display = 'block';
    }

    showLessonList() {
        document.querySelector('.lessons-grid').style.display = 'grid';
        document.getElementById('lessonContainer').style.display = 'none';
        this.currentLesson = null;
    }

    loadLessonContent(lessonType) {
        const lessonTitle = document.getElementById('lessonTitle');
        const lessonContent = document.getElementById('lessonContent');

        // Set lesson title
        const titles = {
            'fractions': 'Дроби - Разбиране и сравнение',
            'geometry': 'Геометрия - Форми и свойства',
            'percentages': 'Проценти - Изчисления и приложения',
            'linear-equations': 'Линейни уравнения - Решаване и баланс'
        };
        lessonTitle.textContent = titles[lessonType] || 'Урок';

        // Load lesson content
        switch(lessonType) {
            case 'fractions':
                this.loadFractionsLesson(lessonContent);
                break;
            case 'geometry':
                this.loadGeometryLesson(lessonContent);
                break;
            case 'percentages':
                this.loadPercentagesLesson(lessonContent);
                break;
            case 'linear-equations':
                this.loadLinearEquationsLesson(lessonContent);
                break;
        }
    }

    loadFractionsLesson(container) {
        container.innerHTML = `
            <div class="lesson-intro">
                <h3>Какво представляват дробите?</h3>
                <p>Дробите показват части от цяло. Числителят (горе) показва колко части вземаме, знаменателят (долу) показва на колко равни части е разделено цялото.</p>
            </div>

            <div class="interactive-slider">
                <h4>Визуализация на дроби</h4>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Числител: <span id="numeratorValue">1</span></span>
                        <span>Знаменател: <span id="denominatorValue">2</span></span>
                    </div>
                    <input type="range" min="1" max="8" value="1" class="slider" id="numeratorSlider">
                    <input type="range" min="2" max="8" value="2" class="slider" id="denominatorSlider">
                </div>
                
                <div class="visualization">
                    <div class="fraction-visual">
                        <span id="fractionText">1/2</span>
                        <div class="fraction-bar">
                            <div class="fraction-fill" id="fractionFill" style="width: 50%"></div>
                        </div>
                        <span id="fractionDecimal">0.5</span>
                    </div>
                </div>
            </div>

            <div class="lesson-step">
                <h4>Сравнение на дроби</h4>
                <p>Плъзгайте лентите, за да видите коя дроб е по-голяма. Дробите с по-малък знаменател имат по-големи части!</p>
                
                <div class="interactive-controls">
                    <div class="control-group">
                        <label class="control-label">Дроб 1</label>
                        <input type="range" min="1" max="4" value="1" class="slider" id="compareNum1">
                        <input type="range" min="2" max="8" value="2" class="slider" id="compareDenom1">
                        <div class="value-display" id="compareFraction1">1/2 = 0.5</div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">Дроб 2</label>
                        <input type="range" min="1" max="4" value="1" class="slider" id="compareNum2">
                        <input type="range" min="2" max="8" value="4" class="slider" id="compareDenom2">
                        <div class="value-display" id="compareFraction2">1/4 = 0.25</div>
                    </div>
                </div>
                
                <div class="visualization">
                    <div id="comparisonResult" style="font-size: 1.2rem; font-weight: bold; color: var(--primary);">
                        1/2 > 1/4
                    </div>
                </div>
            </div>
        `;

        this.setupFractionsInteractivity();
    }

    setupFractionsInteractivity() {
        // Basic fraction visualization
        const updateFraction = () => {
            const numerator = parseInt(document.getElementById('numeratorSlider').value);
            const denominator = parseInt(document.getElementById('denominatorSlider').value);
            const fraction = numerator / denominator;
            const percentage = Math.min((numerator / denominator) * 100, 100);

            document.getElementById('numeratorValue').textContent = numerator;
            document.getElementById('denominatorValue').textContent = denominator;
            document.getElementById('fractionText').textContent = `${numerator}/${denominator}`;
            document.getElementById('fractionDecimal').textContent = fraction.toFixed(2);
            document.getElementById('fractionFill').style.width = `${percentage}%`;
        };

        document.getElementById('numeratorSlider').addEventListener('input', updateFraction);
        document.getElementById('denominatorSlider').addEventListener('input', updateFraction);
        updateFraction();

        // Fraction comparison
        const updateComparison = () => {
            const num1 = parseInt(document.getElementById('compareNum1').value);
            const denom1 = parseInt(document.getElementById('compareDenom1').value);
            const num2 = parseInt(document.getElementById('compareNum2').value);
            const denom2 = parseInt(document.getElementById('compareDenom2').value);
            
            const fraction1 = num1 / denom1;
            const fraction2 = num2 / denom2;

            document.getElementById('compareFraction1').textContent = `${num1}/${denom1} = ${fraction1.toFixed(2)}`;
            document.getElementById('compareFraction2').textContent = `${num2}/${denom2} = ${fraction2.toFixed(2)}`;

            let result;
            if (fraction1 > fraction2) {
                result = `${num1}/${denom1} > ${num2}/${denom2}`;
            } else if (fraction1 < fraction2) {
                result = `${num1}/${denom1} < ${num2}/${denom2}`;
            } else {
                result = `${num1}/${denom1} = ${num2}/${denom2}`;
            }

            document.getElementById('comparisonResult').textContent = result;
        };

        document.getElementById('compareNum1').addEventListener('input', updateComparison);
        document.getElementById('compareDenom1').addEventListener('input', updateComparison);
        document.getElementById('compareNum2').addEventListener('input', updateComparison);
        document.getElementById('compareDenom2').addEventListener('input', updateComparison);
        updateComparison();
    }

    loadGeometryLesson(container) {
        container.innerHTML = `
            <div class="lesson-intro">
                <h3>Геометрични форми и техните свойства</h3>
                <p>Различните форми имат различни свойства. Променяйте размерите, за да видите как се изменят площта и периметъра.</p>
            </div>

            <div class="interactive-slider">
                <h4>Изследвайте формите</h4>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Форма: 
                            <select id="shapeSelector" class="control-input">
                                <option value="rectangle">Правоъгълник</option>
                                <option value="triangle">Триъгълник</option>
                                <option value="circle">Кръг</option>
                            </select>
                        </span>
                    </div>
                    
                    <div class="slider-label">
                        <span>Ширина/Радиус: <span id="widthValue">100</span>px</span>
                    </div>
                    <input type="range" min="50" max="200" value="100" class="slider" id="widthSlider">
                    
                    <div class="slider-label">
                        <span>Височина: <span id="heightValue">80</span>px</span>
                    </div>
                    <input type="range" min="50" max="200" value="80" class="slider" id="heightSlider">
                </div>
                
                <div class="visualization">
                    <div class="geometry-shape shape-rectangle" id="geometryShape"></div>
                </div>
                
                <div class="value-display">
                    Площ: <span id="areaValue">8000</span>px² | 
                    Периметър: <span id="perimeterValue">360</span>px
                </div>
            </div>

            <div class="lesson-step">
                <h4>Свойства на формите</h4>
                <p>Всяка форма има уникални свойства:</p>
                <ul>
                    <li><strong>Правоъгълник:</strong> Противоположните страни са равни, всички ъгли са 90°</li>
                    <li><strong>Триъгълник:</strong> Сборът от ъглите е винаги 180°</li>
                    <li><strong>Кръг:</strong> Всички точки са на равно разстояние от центъра</li>
                </ul>
            </div>
        `;

        this.setupGeometryInteractivity();
    }

    setupGeometryInteractivity() {
        const updateGeometry = () => {
            const shape = document.getElementById('shapeSelector').value;
            const width = parseInt(document.getElementById('widthSlider').value);
            const height = parseInt(document.getElementById('heightSlider').value);
            
            const shapeElement = document.getElementById('geometryShape');
            shapeElement.className = 'geometry-shape';
            
            let area, perimeter;

            switch(shape) {
                case 'rectangle':
                    shapeElement.classList.add('shape-rectangle');
                    shapeElement.style.width = width + 'px';
                    shapeElement.style.height = height + 'px';
                    area = width * height;
                    perimeter = 2 * (width + height);
                    break;
                case 'triangle':
                    shapeElement.classList.add('shape-triangle');
                    shapeElement.style.borderBottomWidth = height + 'px';
                    shapeElement.style.borderLeftWidth = (width/2) + 'px';
                    shapeElement.style.borderRightWidth = (width/2) + 'px';
                    area = (width * height) / 2;
                    perimeter = width + 2 * Math.sqrt((width/2)**2 + height**2);
                    break;
                case 'circle':
                    shapeElement.classList.add('shape-circle');
                    shapeElement.style.width = width + 'px';
                    shapeElement.style.height = width + 'px';
                    area = Math.PI * (width/2) ** 2;
                    perimeter = 2 * Math.PI * (width/2);
                    break;
            }

            document.getElementById('widthValue').textContent = width;
            document.getElementById('heightValue').textContent = height;
            document.getElementById('areaValue').textContent = Math.round(area);
            document.getElementById('perimeterValue').textContent = Math.round(perimeter);
        };

        document.getElementById('shapeSelector').addEventListener('change', updateGeometry);
        document.getElementById('widthSlider').addEventListener('input', updateGeometry);
        document.getElementById('heightSlider').addEventListener('input', updateGeometry);
        updateGeometry();
    }

    loadPercentagesLesson(container) {
        container.innerHTML = `
            <div class="lesson-intro">
                <h3>Проценти в реалния живот</h3>
                <p>Процентите показват част от 100. Използват се за отстъпки, увеличения и много други ежедневни ситуации.</p>
            </div>

            <div class="interactive-slider">
                <h4>Отстъпки в магазина</h4>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Първоначална цена: <span id="originalPriceValue">100</span> лв.</span>
                    </div>
                    <input type="range" min="50" max="500" value="100" class="slider" id="originalPriceSlider">
                    
                    <div class="slider-label">
                        <span>Отстъпка: <span id="discountValue">20</span>%</span>
                    </div>
                    <input type="range" min="0" max="50" value="20" class="slider" id="discountSlider">
                </div>
                
                <div class="visualization">
                    <div class="percentage-bar">
                        <div class="percentage-fill" id="discountFill" style="width: 20%">20%</div>
                    </div>
                    <div style="text-align: center; margin-top: 15px;">
                        <div style="font-size: 1.2rem; margin-bottom: 5px;">
                            <span style="text-decoration: line-through; color: var(--accent);">100 лв.</span>
                            <span style="color: var(--secondary); font-weight: bold;"> → 80 лв.</span>
                        </div>
                        <div style="color: var(--secondary); font-weight: bold;">
                            Спестявате: 20 лв.
                        </div>
                    </div>
                </div>
            </div>

            <div class="lesson-step">
                <h4>Изчисляване на проценти</h4>
                <p>Процент = (Част / Цяло) × 100%</p>
                
                <div class="interactive-controls">
                    <div class="control-group">
                        <label class="control-label">Част</label>
                        <input type="range" min="0" max="100" value="25" class="slider" id="partSlider">
                        <div class="value-display" id="partValue">25</div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">Цяло</label>
                        <input type="range" min="1" max="200" value="100" class="slider" id="wholeSlider">
                        <div class="value-display" id="wholeValue">100</div>
                    </div>
                </div>
                
                <div class="visualization">
                    <div class="percentage-bar">
                        <div class="percentage-fill" id="percentageFill" style="width: 25%">
                            <span id="percentageText">25%</span>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 10px; font-weight: bold;">
                        <span id="percentageCalculation">25 от 100 = 25%</span>
                    </div>
                </div>
            </div>
        `;

        this.setupPercentagesInteractivity();
    }

    setupPercentagesInteractivity() {
        // Discount calculation
        const updateDiscount = () => {
            const originalPrice = parseInt(document.getElementById('originalPriceSlider').value);
            const discount = parseInt(document.getElementById('discountSlider').value);
            const discountAmount = (originalPrice * discount) / 100;
            const finalPrice = originalPrice - discountAmount;

            document.getElementById('originalPriceValue').textContent = originalPrice;
            document.getElementById('discountValue').textContent = discount;
            document.getElementById('discountFill').style.width = `${discount}%`;
            document.getElementById('discountFill').textContent = `${discount}%`;

            // Update the price display
            const visualization = document.querySelector('.visualization');
            visualization.innerHTML = `
                <div class="percentage-bar">
                    <div class="percentage-fill" id="discountFill" style="width: ${discount}%">${discount}%</div>
                </div>
                <div style="text-align: center; margin-top: 15px;">
                    <div style="font-size: 1.2rem; margin-bottom: 5px;">
                        <span style="text-decoration: line-through; color: var(--accent);">${originalPrice} лв.</span>
                        <span style="color: var(--secondary); font-weight: bold;"> → ${finalPrice} лв.</span>
                    </div>
                    <div style="color: var(--secondary); font-weight: bold;">
                        Спестявате: ${discountAmount} лв.
                    </div>
                </div>
            `;
        };

        document.getElementById('originalPriceSlider').addEventListener('input', updateDiscount);
        document.getElementById('discountSlider').addEventListener('input', updateDiscount);
        updateDiscount();

        // Percentage calculation
        const updatePercentage = () => {
            const part = parseInt(document.getElementById('partSlider').value);
            const whole = parseInt(document.getElementById('wholeSlider').value);
            const percentage = whole > 0 ? Math.round((part / whole) * 100) : 0;

            document.getElementById('partValue').textContent = part;
            document.getElementById('wholeValue').textContent = whole;
            document.getElementById('percentageFill').style.width = `${percentage}%`;
            document.getElementById('percentageText').textContent = `${percentage}%`;
            document.getElementById('percentageCalculation').textContent = 
                `${part} от ${whole} = ${percentage}%`;
        };

        document.getElementById('partSlider').addEventListener('input', updatePercentage);
        document.getElementById('wholeSlider').addEventListener('input', updatePercentage);
        updatePercentage();
    }

    loadLinearEquationsLesson(container) {
        container.innerHTML = `
            <div class="lesson-intro">
                <h3>Решаване на линейни уравнения</h3>
                <p>Уравненията са като везни - това, което правите от едната страна, трябва да направите и от другата, за да запазите баланса.</p>
            </div>

            <div class="interactive-slider">
                <h4>Баланс на уравненията</h4>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Уравнение: <span id="equationDisplay">2x + 3 = 7</span></span>
                    </div>
                </div>
                
                <div class="visualization">
                    <div class="equation-balance">
                        <div class="balance-scale">
                            <div class="balance-side" id="leftSide">
                                <div>2x</div>
                                <div>+ 3</div>
                            </div>
                            <div class="balance-beam"></div>
                            <div class="balance-side" id="rightSide">
                                <div>7</div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px; font-weight: bold;">
                        Решение: x = <span id="solutionValue">2</span>
                    </div>
                </div>
            </div>

            <div class="lesson-step">
                <h4>Стъпки за решаване</h4>
                <p>Да решим уравнението стъпка по стъпка:</p>
                
                <div class="interactive-controls">
                    <div class="control-group">
                        <label class="control-label">Коефициент пред x</label>
                        <input type="range" min="1" max="5" value="2" class="slider" id="coefficientSlider">
                        <div class="value-display" id="coefficientValue">2</div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">Свободен член</label>
                        <input type="range" min="1" max="10" value="3" class="slider" id="constantSlider">
                        <div class="value-display" id="constantValue">3</div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">Резултат</label>
                        <input type="range" min="5" max="20" value="7" class="slider" id="resultSlider">
                        <div class="value-display" id="resultValue">7</div>
                    </div>
                </div>
                
                <div class="visualization">
                    <div style="line-height: 2;">
                        <div>1. Изваждаме свободния член: <span id="step1">2x = 4</span></div>
                        <div>2. Делим на коефициента: <span id="step2">x = 2</span></div>
                        <div>3. Проверка: <span id="step3">2×2 + 3 = 7 ✓</span></div>
                    </div>
                </div>
            </div>
        `;

        this.setupLinearEquationsInteractivity();
    }

    setupLinearEquationsInteractivity() {
        const updateEquation = () => {
            const coefficient = parseInt(document.getElementById('coefficientSlider').value);
            const constant = parseInt(document.getElementById('constantSlider').value);
            const result = parseInt(document.getElementById('resultSlider').value);
            
            // Calculate solution
            const solution = (result - constant) / coefficient;

            // Update displays
            document.getElementById('coefficientValue').textContent = coefficient;
            document.getElementById('constantValue').textContent = constant;
            document.getElementById('resultValue').textContent = result;
            document.getElementById('equationDisplay').textContent = 
                `${coefficient}x + ${constant} = ${result}`;
            document.getElementById('solutionValue').textContent = solution;

            // Update steps
            document.getElementById('step1').textContent = 
                `${coefficient}x = ${result - constant}`;
            document.getElementById('step2').textContent = 
                `x = ${solution}`;
            document.getElementById('step3').textContent = 
                `${coefficient}×${solution} + ${constant} = ${result} ✓`;

            // Update balance visualization
            document.getElementById('leftSide').innerHTML = `
                <div>${coefficient}x</div>
                <div>+ ${constant}</div>
            `;
            document.getElementById('rightSide').innerHTML = `
                <div>${result}</div>
            `;
        };

        document.getElementById('coefficientSlider').addEventListener('input', updateEquation);
        document.getElementById('constantSlider').addEventListener('input', updateEquation);
        document.getElementById('resultSlider').addEventListener('input', updateEquation);
        updateEquation();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LessonsManager();
});