// Global variables
let calculatorForm;

// Form data persistence
const FORM_STORAGE_KEY = 'fso_calculator_form_data';

// Coverage type mapping
const coverageTypeMap = {
    'self': 'Self Only',
    'self-plus-one': 'Self Plus One',
    'family': 'Family'
};

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(calculatorForm);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    console.log('Form data:', data);

    // Set default values for health insurance if not provided
    if (!data['current-plan']) {
        data['current-plan'] = 'BCBS-basic';
    }
    if (!data['coverage-type']) {
        data['coverage-type'] = 'self';
    }
    if (!data['state']) {
        data['state'] = 'DC';
    }

    // Create calculator instance
    const calculator = new Calculator(data);
    
    try {
        // Calculate benefits
        const results = calculator.calculateAllBenefits();
        
        console.log('Calculation results:', results);
        console.log('Health insurance inputs:', {
            plan: data['current-plan'],
            coverageType: data['coverage-type'],
            state: data['state']
        });
        console.log('Retirement eligibility:', {
            age: calculator.age,
            yearsOfService: calculator.yearsOfService,
            isRegularEligible: calculator.isRegularRetirementEligible(),
            isVeraEligible: calculator.isVeraEligible(),
            isTeraEligible: calculator.isTeraEligible()
        });
        
        // Show results section
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }

        // Display results
        displayResults(results);
        
        // Show the appropriate tab based on available results
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Show Summary tab first
        const summaryTab = document.querySelector('[data-tab="summary"]');
        const summaryContent = document.getElementById('summary-tab');
        if (summaryTab && summaryContent) {
            summaryTab.classList.add('active');
            summaryContent.classList.add('active');
        }

        // Add click handlers to switch between tabs
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                const content = document.getElementById(`${tabId}-tab`);
                if (content) {
                    content.classList.add('active');
                }
            });
        });
    } catch (error) {
        console.error('Error calculating benefits:', error);
        alert('An error occurred while calculating benefits. Please check your inputs and try again.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize calculator form
    calculatorForm = document.getElementById('calculator-form');
    if (!calculatorForm) {
        console.error('Calculator form not found');
        return;
    }

    // Initialize dark mode
    initializeDarkMode();

    // Initialize grade and step handler
    initializeGradeStepHandler();

    // Initialize TERA toggle
    initializeTeraToggle();

    // Initialize tab switching
    initializeTabs();

    // Add form submit handler
    calculatorForm.addEventListener('submit', handleSubmit);

    // Add form reset handler
    calculatorForm.addEventListener('reset', function() {
        // Reset TERA fields visibility
        const teraFields = document.getElementById('tera-fields');
        if (teraFields) {
            teraFields.style.display = 'none';
        }
        
        // Reset results display
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }

        // Reset tab visibility
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active'));
    });

    // Load saved form data
    loadFormData();

    // Save form data on change
    calculatorForm.addEventListener('change', saveFormData);
    calculatorForm.addEventListener('input', saveFormData);

    // Clear saved data on form reset
    calculatorForm.addEventListener('reset', () => {
        localStorage.removeItem(FORM_STORAGE_KEY);
    });

    // Run tests if in test mode
    if (window.location.search.includes('test=true')) {
        console.log('Running tests...');
        
        // Run calculator tests first
        if (typeof runCalculatorTests !== 'undefined') {
            console.log('Running calculator tests...');
            const calculatorTestResults = runCalculatorTests();
            console.log('Calculator test results:', calculatorTestResults);
        } else {
            console.warn('Calculator tests not available. Make sure test-calculator.js is loaded.');
        }
        
        // Then run UI tests
        if (typeof UITestSuite !== 'undefined') {
            const testSuite = new UITestSuite();
            await testSuite.runAllTests();
        } else {
            console.warn('Test suite not available. Make sure test-ui.js is loaded.');
        }
    }
});

// Initialize tab switching functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const content = document.getElementById(`${tabId}-tab`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

function displayResults(results) {
    // Display retirement scenarios
    const retirementScenariosDiv = document.getElementById('retirement-scenarios');
    if (retirementScenariosDiv) {
        retirementScenariosDiv.innerHTML = '';

        if (results.retirementScenarios.length === 0) {
            retirementScenariosDiv.innerHTML = '<p class="alert alert-warning">Based on your inputs, you are not currently eligible for retirement.</p>';
        } else {
            // First display service and salary summary
            const serviceDetails = results.serviceDetails;
            retirementScenariosDiv.innerHTML = `
                <div class="benefit-section">
                    <h4>Service and Salary Summary</h4>
                    <div class="comparison-table">
                        <table>
                            <tr>
                                <th>High-Three Average Salary</th>
                                <td>${formatCurrency(serviceDetails.highThreeAverage.amount)}</td>
                            </tr>
                            <tr>
                                <th>Service Duration</th>
                                <td>${serviceDetails.serviceDuration.years} years, ${serviceDetails.serviceDuration.months} months, ${serviceDetails.serviceDuration.days} days</td>
                            </tr>
                            ${serviceDetails.sickLeaveService ? `
                            <tr>
                                <th>Creditable Sick Leave</th>
                                <td>${serviceDetails.sickLeaveService.years} years, ${serviceDetails.sickLeaveService.months} months, ${serviceDetails.sickLeaveService.days} days</td>
                            </tr>
                            <tr>
                                <th>Total Credited Service</th>
                                <td>${serviceDetails.totalService.years} years, ${serviceDetails.totalService.months} months, ${serviceDetails.totalService.days} days</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <th>Minimum Retirement Age (MRA)</th>
                                <td>${serviceDetails.mra} years</td>
                            </tr>
                        </table>
                    </div>
                </div>
            `;

            // Then display each retirement scenario
            results.retirementScenarios.forEach(scenario => {
                const scenarioDiv = document.createElement('div');
                scenarioDiv.className = 'retirement-scenario';
                
                const annualAmount = formatCurrency(scenario.annual);
                const monthlyAmount = formatCurrency(scenario.monthly);
                
                let details = '';
                if (scenario.details) {
                    details = `
                        <div class="calculation-details">
                            <h5>Calculation Details</h5>
                            <p><strong>Formula:</strong> ${scenario.details.calculation.formula}</p>
                            <ul>
                                ${scenario.details.calculation.steps.map(step => `<li>${step}</li>`).join('')}
                            </ul>
                            ${scenario.details.notes ? `
                                <h5>Notes</h5>
                                <ul>
                                    ${scenario.details.notes.map(note => `<li>${note}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${scenario.details.citations ? `
                                <h5>References</h5>
                                <ul>
                                    ${scenario.details.citations.map(citation => `<li>${citation}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    `;
                }
                
                scenarioDiv.innerHTML = `
                    <h4>${scenario.type} Retirement</h4>
                    <div class="scenario-details">
                        <p><strong>Annual Annuity:</strong> ${annualAmount}</p>
                        <p><strong>Monthly Annuity:</strong> ${monthlyAmount}</p>
                        ${details}
                    </div>
                `;
                retirementScenariosDiv.appendChild(scenarioDiv);
            });
        }
    }

    // Display severance pay
    const severanceDiv = document.getElementById('severance-results');
    if (severanceDiv) {
        const severance = results.severance;
        severanceDiv.innerHTML = `
            <div class="benefit-summary">
                <div class="benefit-section">
                    <h4>Severance Pay</h4>
                    <div class="benefit-item">
                        <h5>Total Amount</h5>
                        <p class="benefit-amount">${formatCurrency(severance.total)}</p>
                    </div>
                    ${severance.details ? `
                        <div class="calculation-details">
                            <h5>Calculation Details</h5>
                            <p><strong>Formula:</strong> ${severance.details.calculation.formula}</p>
                            <ul>
                                ${severance.details.calculation.steps.map(step => `<li>${step}</li>`).join('')}
                            </ul>
                            <h5>Installment Schedule</h5>
                            <ul>
                                ${severance.details.installments.map(installment => 
                                    `<li>${installment.year}: ${formatCurrency(installment.amount)}</li>`
                                ).join('')}
                            </ul>
                            ${severance.details.notes ? `
                                <h5>Notes</h5>
                                <ul>
                                    ${severance.details.notes.map(note => `<li>${note}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${severance.details.citations ? `
                                <h5>References</h5>
                                <ul>
                                    ${severance.details.citations.map(citation => `<li>${citation}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Display health insurance
    const healthDiv = document.getElementById('health-results');
    if (healthDiv) {
        const health = results.health;
        healthDiv.innerHTML = `
            <div class="comparison-table">
                <table>
                    <thead>
                        <tr>
                            <th>Coverage Details</th>
                            <th>ACA Marketplace</th>
                            <th>COBRA</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Monthly Premium</td>
                            <td>${formatCurrency(health.aca.monthly)}</td>
                            <td>${formatCurrency(health.cobra.monthly)}</td>
                        </tr>
                        <tr>
                            <td>Annual Cost</td>
                            <td>${formatCurrency(health.aca.annual)}</td>
                            <td>${formatCurrency(health.cobra.annual)}</td>
                        </tr>
                        <tr>
                            <td>Coverage Duration</td>
                            <td>Full Year</td>
                            <td>${health.cobra.duration} months</td>
                        </tr>
                        <tr>
                            <td>Total Cost</td>
                            <td>${formatCurrency(health.aca.totalCost)}</td>
                            <td>${formatCurrency(health.cobra.totalCost)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ${health.details ? `
                <div class="calculation-details">
                    <h5>Calculation Details</h5>
                    <p><strong>ACA Marketplace Formula:</strong> ${health.details.acaCalculation.formula}</p>
                    <ul>
                        ${health.details.acaCalculation.steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                    <p><strong>COBRA Formula:</strong> ${health.details.cobraCalculation.formula}</p>
                    <ul>
                        ${health.details.cobraCalculation.steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                    ${health.details.notes ? `
                        <h5>Notes</h5>
                        <ul>
                            <li>These estimates are based on comparable coverage options for your current enrollment type and coverage level.</li>
                            ${health.details.notes.map(note => `<li>${note}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${health.details.citations ? `
                        <h5>References</h5>
                        <ul>
                            ${health.details.citations.map(citation => `<li>${citation}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}
        `;
    }

    // Display input summary
    const inputSummaryDiv = document.getElementById('input-summary');
    if (inputSummaryDiv) {
        inputSummaryDiv.innerHTML = `
            <div class="benefit-summary">
                <div class="benefit-item">
                    <h4>Age</h4>
                    <p class="benefit-amount">${results.userInputs.age}</p>
                </div>
                <div class="benefit-item">
                    <h4>Years of Service</h4>
                    <p class="benefit-amount">${results.userInputs.yearsOfService}</p>
                </div>
                <div class="benefit-item">
                    <h4>Base Salary</h4>
                    <p class="benefit-amount">${formatCurrency(results.userInputs.baseSalary)}</p>
                </div>
                <div class="benefit-item">
                    <h4>High-3 Average</h4>
                    <p class="benefit-amount">${formatCurrency(results.userInputs.highThreeAverage)}</p>
                </div>
                <div class="benefit-item">
                    <h4>V/TERA Offered</h4>
                    <p class="benefit-amount">${results.userInputs.isTeraOffered ? 'Yes' : 'No'}</p>
                </div>
            </div>
        `;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Grade and Step Configuration
const GRADE_STEPS = {
    'SFS': {
        'Career Minister': { step: 1, text: 'Career Minister' },
        'Minister Counselor': { steps: [6, 7, 8, 9, 10], text: 'Minister Counselor' },
        'Counselor': { steps: [6, 7, 8, 9, 10], text: 'Counselor' }
    },
    'FS-01': { maxStep: 14 },
    'FS-02': { maxStep: 14 },
    'FS-03': { maxStep: 14 },
    'FS-04': { maxStep: 14 },
    'FS-05': { maxStep: 14 },
    'FS-06': { maxStep: 14 }
};

// Handle grade and step selection
function initializeGradeStepHandler() {
    const gradeSelect = document.getElementById('fs-grade');
    const stepSelect = document.getElementById('fs-step');
    
    if (!gradeSelect || !stepSelect) {
        console.warn('Grade or step select elements not found');
        return;
    }

    function updateStepDropdown(grade) {
        // Clear existing options
        stepSelect.innerHTML = '<option value="">Select Step/Rank</option>';

        if (!grade) return;

        if (grade === 'SFS') {
            // SFS specific options
            Object.entries(GRADE_STEPS.SFS).forEach(([rank, data]) => {
                if (data.step) {
                    // Single step rank (Career Minister)
                    stepSelect.add(new Option(data.text, data.step));
                } else {
                    // Multiple step rank (Minister Counselor, Counselor)
                    data.steps.forEach(step => {
                        stepSelect.add(new Option(`${data.text} (Step ${step})`, step));
                    });
                }
            });
        } else {
            // Regular FS grades
            const maxStep = GRADE_STEPS[grade]?.maxStep || 14;
            for (let i = 1; i <= maxStep; i++) {
                stepSelect.add(new Option(`Step ${i}`, i));
            }
        }

        // Force redraw for iOS
        stepSelect.style.display = 'none';
        stepSelect.offsetHeight;
        stepSelect.style.display = '';
    }

    // Add event listeners
    gradeSelect.addEventListener('change', function() {
        updateStepDropdown(this.value);
    });
    
    // Initial setup
    if (gradeSelect.value) {
        updateStepDropdown(gradeSelect.value);
    }
}

// Show/hide TERA fields based on selection
function initializeTeraToggle() {
    const teraEligibleSelect = document.getElementById('tera-eligible');
    const teraFields = document.getElementById('tera-fields');

    teraEligibleSelect.addEventListener('change', function() {
        const isVisible = this.value === 'yes';
        teraFields.style.display = isVisible ? 'block' : 'none';
        
        // Update required attributes
        const teraInputs = teraFields.querySelectorAll('select');
        teraInputs.forEach(input => {
            input.required = isVisible;
            if (!isVisible) {
                input.value = input.id === 'tera-years' ? '15' : '43';
            }
        });
    });
}

// Validate service computation date
function validateServiceDuration() {
    const yearsService = document.getElementById('years-service');
    const serviceComputationDate = document.getElementById('service-computation-date');
    const warningDiv = document.getElementById('service-duration-warning');
    const warningMessage = document.getElementById('service-duration-message');

    if (!yearsService || !serviceComputationDate || !warningDiv || !warningMessage) {
        return;
    }

    if (serviceComputationDate.value) {
        const scd = new Date(serviceComputationDate.value);
        const today = new Date();
        const yearsDiff = (today - scd) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Round to nearest quarter year
        const roundedYears = Math.round(yearsDiff * 4) / 4;
        
        // Update years of service dropdown
        yearsService.value = roundedYears;
        
        // Show warning if there's a discrepancy
        if (Math.abs(roundedYears - yearsDiff) > 0.01) {
            warningMessage.textContent = `Service computation date indicates ${yearsDiff.toFixed(1)} years of service.`;
            warningDiv.style.display = 'block';
        } else {
            warningDiv.style.display = 'none';
        }
    } else {
        warningDiv.style.display = 'none';
    }
}

// Clear service computation date
function clearSCD() {
    const serviceComputationDate = document.getElementById('service-computation-date');
    const warningDiv = document.getElementById('service-duration-warning');
    
    if (serviceComputationDate) {
        serviceComputationDate.value = '';
    }
    if (warningDiv) {
        warningDiv.style.display = 'none';
    }
}

// Update health insurance plan prices
function updatePlanPrices() {
    const planSelect = document.getElementById('current-plan');
    const coverageTypeSelect = document.getElementById('coverage-type');
    const priceDisplay = document.getElementById('plan-price-display');

    if (!planSelect || !coverageTypeSelect || !priceDisplay) {
        return;
    }

    const plan = planSelect.value;
    const coverageType = coverageTypeSelect.value;

    if (plan && coverageType) {
        const rates = {
            'BCBS-basic': {
                'Self Only': {
                    biweekly: 75.50,
                    monthly: 163.58
                },
                'Self Plus One': {
                    biweekly: 167.50,
                    monthly: 362.92
                },
                'Family': {
                    biweekly: 175.50,
                    monthly: 380.25
                }
            },
            'FSBP-standard': {
                'Self Only': {
                    biweekly: 82.50,
                    monthly: 178.75
                },
                'Self Plus One': {
                    biweekly: 175.50,
                    monthly: 380.25
                },
                'Family': {
                    biweekly: 185.50,
                    monthly: 401.92
                }
            },
            'AETNA-direct': {
                'Self Only': {
                    biweekly: 78.50,
                    monthly: 170.08
                },
                'Self Plus One': {
                    biweekly: 165.50,
                    monthly: 358.58
                },
                'Family': {
                    biweekly: 175.50,
                    monthly: 380.25
                }
            },
            'GEHA-standard': {
                'Self Only': {
                    biweekly: 72.50,
                    monthly: 157.08
                },
                'Self Plus One': {
                    biweekly: 155.50,
                    monthly: 336.92
                },
                'Family': {
                    biweekly: 165.50,
                    monthly: 358.58
                }
            },
            'Compass Rose': {
                'Self Only': {
                    biweekly: 85.50,
                    monthly: 185.25
                },
                'Self Plus One': {
                    biweekly: 180.50,
                    monthly: 391.08
                },
                'Family': {
                    biweekly: 190.50,
                    monthly: 412.75
                }
            }
        };

        const planRates = rates[plan]?.[coverageType];
        if (planRates) {
            priceDisplay.innerHTML = `
                <p><strong>Monthly Premium:</strong> ${formatCurrency(planRates.monthly)}</p>
                <p><strong>Bi-weekly Rate:</strong> ${formatCurrency(planRates.biweekly)}</p>
            `;
            priceDisplay.style.display = 'block';
        } else {
            priceDisplay.style.display = 'none';
        }
    } else {
        priceDisplay.style.display = 'none';
    }
}

// Dark mode functionality
function initializeDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Add click event listener
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Save preference
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        // Update button icon
        const icon = themeToggle.querySelector('svg');
        if (icon) {
            icon.innerHTML = isDarkMode 
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
        }
    });

    // Set initial icon based on current theme
    const icon = themeToggle.querySelector('svg');
    if (icon) {
        icon.innerHTML = document.body.classList.contains('dark-mode')
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
    }
}

// Save form data to local storage
function saveFormData() {
    const formData = new FormData(calculatorForm);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formObject));
}

// Load form data from local storage
function loadFormData() {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
        const formObject = JSON.parse(savedData);
        Object.keys(formObject).forEach(key => {
            const input = calculatorForm.elements[key];
            if (input) {
                input.value = formObject[key];
                // Trigger change event to update any dependent fields
                input.dispatchEvent(new Event('change'));
            }
        });
    }
} 