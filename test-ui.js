// UI Test Suite for FSO Calculator
class UITestSuite {
    constructor() {
        this.testResults = [];
        this.form = document.getElementById('calculator-form');
    }

    async runAllTests() {
        console.log('Starting UI Test Suite...');
        
        // Run basic form tests
        await this.testBasicFormSubmission();
        
        // Run V/TERA tests
        await this.testTeraFunctionality();
        
        // Run health insurance tests
        await this.testHealthInsuranceOptions();
        
        // Run advanced data tests
        await this.testAdvancedDataInput();
        
        // Display results
        this.displayResults();
    }

    async testBasicFormSubmission() {
        console.log('Testing Basic Form Submission...');
        
        // Test Case 1: Valid basic submission
        const basicData = {
            'current-age': '50',
            'years-of-service': '20',
            'tera-eligible': 'no',
            'tera-years': '20',
            'tera-age': '50',
            'current-plan': 'BCBS-basic',
            'coverage-type': 'self',
            'state': 'DC'
        };

        try {
            await this.submitForm(basicData);
            const results = this.getResults();
            this.testResults.push({
                name: 'Basic Form Submission',
                passed: this.validateBasicResults(results),
                details: results
            });
        } catch (error) {
            this.testResults.push({
                name: 'Basic Form Submission',
                passed: false,
                error: error.message
            });
        }
    }

    async testTeraFunctionality() {
        console.log('Testing V/TERA Functionality...');
        
        // Test Case 2: V/TERA enabled
        const teraData = {
            'current-age': '45',
            'years-of-service': '15',
            'tera-eligible': 'yes',
            'tera-years': '15',
            'tera-age': '45',
            'current-plan': 'BCBS-basic',
            'coverage-type': 'self',
            'state': 'DC'
        };

        try {
            await this.submitForm(teraData);
            const results = this.getResults();
            this.testResults.push({
                name: 'V/TERA Functionality',
                passed: this.validateTeraResults(results),
                details: results
            });
        } catch (error) {
            this.testResults.push({
                name: 'V/TERA Functionality',
                passed: false,
                error: error.message
            });
        }
    }

    async testHealthInsuranceOptions() {
        console.log('Testing Health Insurance Options...');
        
        // Test Case 3: Different health insurance plans
        const healthPlans = [
            { plan: 'BCBS-basic', coverage: 'Self Only' },
            { plan: 'BCBS-standard', coverage: 'Self + Family' },
            { plan: 'GEHA-standard', coverage: 'Self Only' }
        ];

        for (const plan of healthPlans) {
            const healthData = {
                'current-age': '50',
                'years-of-service': '20',
                'tera-eligible': 'no',
                'tera-years': '20',
                'tera-age': '50',
                'current-plan': plan.plan,
                'coverage-type': plan.coverage === 'Self Only' ? 'self' : 'family',
                'state': 'DC'
            };

            try {
                await this.submitForm(healthData);
                const results = this.getResults();
                this.testResults.push({
                    name: `Health Insurance - ${plan.plan} ${plan.coverage}`,
                    passed: this.validateHealthResults(results, plan),
                    details: results
                });
            } catch (error) {
                this.testResults.push({
                    name: `Health Insurance - ${plan.plan} ${plan.coverage}`,
                    passed: false,
                    error: error.message
                });
            }
        }
    }

    async testAdvancedDataInput() {
        console.log('Testing Advanced Data Input...');
        
        // Test Case 4: Advanced data with SCD and leave
        const advancedData = {
            'current-age': '50',
            'years-of-service': '20',
            'tera-eligible': 'no',
            'tera-years': '20',
            'tera-age': '50',
            'current-plan': 'BCBS-basic',
            'coverage-type': 'self',
            'state': 'DC',
            'service-computation-date': '2003-01-01',
            'annual-leave-balance': '240',
            'sick-leave-balance': '1040'
        };

        try {
            await this.submitForm(advancedData);
            const results = this.getResults();
            this.testResults.push({
                name: 'Advanced Data Input',
                passed: this.validateAdvancedResults(results),
                details: results
            });
        } catch (error) {
            this.testResults.push({
                name: 'Advanced Data Input',
                passed: false,
                error: error.message
            });
        }
    }

    async submitForm(data) {
        // Clear form
        this.form.reset();
        
        // Fill form with test data
        for (const [key, value] of Object.entries(data)) {
            const input = document.getElementById(key);
            if (input) {
                // Set the value
                input.value = value;
                
                // For select elements, also set the selected option
                if (input.tagName === 'SELECT') {
                    const option = Array.from(input.options).find(opt => opt.value === value);
                    if (option) {
                        option.selected = true;
                    }
                }
                
                // Trigger both change and input events
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn(`Input field not found for key: ${key}`);
            }
        }
        
        // Submit form
        this.form.dispatchEvent(new Event('submit', { bubbles: true }));
        
        // Wait for results to be displayed
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    getResults() {
        const resultsSection = document.querySelector('.results-section');
        if (!resultsSection) {
            throw new Error('Results section not found');
        }

        return {
            retirementScenarios: document.getElementById('retirement-scenarios')?.innerHTML || '',
            healthInsurance: document.getElementById('health-insurance')?.innerHTML || '',
            leaveBenefits: document.getElementById('leave-benefits')?.innerHTML || ''
        };
    }

    validateBasicResults(results) {
        if (!results.retirementScenarios) return false;
        return results.retirementScenarios.includes('Based on your inputs') ||
               results.retirementScenarios.includes('Retirement') ||
               results.retirementScenarios.includes('not currently eligible for retirement');
    }

    validateTeraResults(results) {
        if (!results.retirementScenarios) return false;
        return results.retirementScenarios.includes('Based on your inputs') ||
               results.retirementScenarios.includes('Retirement') ||
               results.retirementScenarios.includes('not currently eligible for retirement') ||
               results.retirementScenarios.includes('VERA/TERA');
    }

    validateHealthResults(results, plan) {
        if (!results.retirementScenarios) return false;
        return results.retirementScenarios.includes('Based on your inputs') ||
               results.retirementScenarios.includes('Retirement') ||
               results.retirementScenarios.includes('not currently eligible for retirement');
    }

    validateAdvancedResults(results) {
        if (!results.retirementScenarios) return false;
        return results.retirementScenarios.includes('Based on your inputs') ||
               results.retirementScenarios.includes('Retirement') ||
               results.retirementScenarios.includes('not currently eligible for retirement');
    }

    displayResults() {
        console.log('\nTest Results:');
        console.log('=============');
        
        this.testResults.forEach(result => {
            console.log(`\n${result.name}:`);
            console.log(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
            if (!result.passed) {
                console.log('Error:', result.error);
            }
            if (result.details) {
                console.log('Details:', result.details);
            }
        });

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        console.log(`\nSummary: ${passedTests}/${totalTests} tests passed`);
    }

    // Add a manual test trigger
    static runTests() {
        const testSuite = new UITestSuite();
        testSuite.runAllTests();
    }
}

// Remove automatic execution
// Only run tests when explicitly called
// window.addEventListener('load', () => {
//     const testSuite = new UITestSuite();
//     testSuite.runAllTests();
// }); 