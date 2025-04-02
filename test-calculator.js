// Test cases for FSO Calculator
const testCases = [
    {
        name: "Regular Retirement - Age 50+ with 20+ years",
        inputs: {
            'current-age': 50,
            'years-of-service': 20,
            'fs-grade': 'FS-01',
            'fs-step': '10',
            'current-plan': 'BCBS-basic',
            'coverage-type': 'self',
            'state': 'DC',
            'tera-eligible': 'no',
            'salary-year-1': '197000',
            'salary-year-2': '202000',
            'salary-year-3': '205000'
        },
        expected: {
            regularRetirement: true,
            veraEligible: false,
            teraEligible: false,
            annuity: {
                monthly: 5716.67, // 1.7% * 20 years * $201,333.33 / 12
                annual: 68600
            },
            health: {
                fehb: {
                    monthly: 163.58,
                    annual: 1962.96,
                    biweekly: 75.50
                },
                cobra: {
                    monthly: 166.85,
                    annual: 2002.22,
                    biweekly: 77.01
                }
            }
        }
    },
    {
        name: "Regular Retirement - Age 60+ with 5+ years",
        inputs: {
            'current-age': 60,
            'years-of-service': 5,
            'fs-grade': 'FS-01',
            'fs-step': '10',
            'current-plan': 'BCBS-basic',
            'coverage-type': 'self',
            'state': 'DC',
            'tera-eligible': 'no',
            'salary-year-1': '197000',
            'salary-year-2': '202000',
            'salary-year-3': '205000'
        },
        expected: {
            regularRetirement: true,
            veraEligible: false,
            teraEligible: false,
            annuity: {
                monthly: 1429.17, // 1.7% * 5 years * $201,333.33 / 12
                annual: 17150
            },
            health: {
                fehb: {
                    monthly: 163.58,
                    annual: 1962.96,
                    biweekly: 75.50
                },
                cobra: {
                    monthly: 166.85,
                    annual: 2002.22,
                    biweekly: 77.01
                }
            }
        }
    },
    {
        name: "VERA Eligible - Age 43+ with 15+ years",
        inputs: {
            'current-age': 43,
            'years-of-service': 15,
            'fs-grade': 'FS-01',
            'fs-step': '10',
            'current-plan': 'BCBS-basic',
            'coverage-type': 'self',
            'state': 'DC',
            'tera-eligible': 'yes',
            'tera-years': 15,
            'tera-age': 43,
            'salary-year-1': '197000',
            'salary-year-2': '202000',
            'salary-year-3': '205000'
        },
        expected: {
            regularRetirement: false,
            veraEligible: true,
            teraEligible: true,
            annuity: {
                monthly: 4287.50, // 1.7% * 15 years * $201,333.33 / 12
                annual: 51450
            },
            health: {
                fehb: {
                    monthly: 163.58,
                    annual: 1962.96,
                    biweekly: 75.50
                },
                cobra: {
                    monthly: 166.85,
                    annual: 2002.22,
                    biweekly: 77.01
                }
            }
        }
    },
    {
        name: "TERA Only - Under 43 with 15+ years",
        inputs: {
            'current-age': 42,
            'years-of-service': 15,
            'fs-grade': 'FS-01',
            'fs-step': '10',
            'current-plan': 'BCBS-basic',
            'coverage-type': 'self',
            'state': 'DC',
            'tera-eligible': 'yes',
            'tera-years': 15,
            'tera-age': 42,
            'salary-year-1': '197000',
            'salary-year-2': '202000',
            'salary-year-3': '205000'
        },
        expected: {
            regularRetirement: false,
            veraEligible: false,
            teraEligible: true,
            annuity: {
                monthly: 3858.75, // 1.7% * 15 years * $201,333.33 / 12 * 0.90 (10% reduction for 5 years under 20)
                annual: 46305
            },
            health: {
                fehb: {
                    monthly: 163.58,
                    annual: 1962.96,
                    biweekly: 75.50
                },
                cobra: {
                    monthly: 166.85,
                    annual: 2002.22,
                    biweekly: 77.01
                }
            }
        }
    }
];

// Add a manual test trigger
function runCalculatorTests() {
    console.log('Starting FSO Calculator Tests\n');
    const testResults = [];
    
    testCases.forEach((testCase, index) => {
        console.log(`Test Case ${index + 1}: ${testCase.name}`);
        console.log('Inputs:', testCase.inputs);
        
        try {
            const calculator = new Calculator(testCase.inputs);
            const results = calculator.calculateAllBenefits();
            
            // Check retirement eligibility
            const actual = {
                regularRetirement: results.retirementScenarios.some(s => s.type === 'Regular'),
                veraEligible: results.retirementScenarios.some(s => s.type === 'VERA'),
                teraEligible: results.retirementScenarios.some(s => s.type === 'TERA')
            };
            
            // Compare expected vs actual
            const eligibilityPassed = Object.keys(testCase.expected)
                .filter(key => ['regularRetirement', 'veraEligible', 'teraEligible'].includes(key))
                .every(key => testCase.expected[key] === actual[key]);
            
            console.log('Expected Eligibility:', {
                regularRetirement: testCase.expected.regularRetirement,
                veraEligible: testCase.expected.veraEligible,
                teraEligible: testCase.expected.teraEligible
            });
            console.log('Actual Eligibility:', actual);
            console.log('Eligibility Status:', eligibilityPassed ? 'PASSED' : 'FAILED');
            
            // Initialize test result object
            const testResult = {
                name: testCase.name,
                eligibilityPassed: eligibilityPassed,
                annuityPassed: true, // Default to true if no annuity test
                healthPassed: true   // Default to true if no health test
            };
            
            // Check annuity amounts if specified
            if (testCase.expected.annuity) {
                const annuityScenario = results.retirementScenarios.find(s => 
                    (testCase.expected.regularRetirement && s.type === 'Regular') ||
                    (testCase.expected.veraEligible && s.type === 'VERA') ||
                    (testCase.expected.teraEligible && s.type === 'TERA')
                );
                
                if (annuityScenario) {
                    const monthlyDiff = Math.abs(annuityScenario.monthly - testCase.expected.annuity.monthly);
                    const annualDiff = Math.abs(annuityScenario.annual - testCase.expected.annuity.annual);
                    const tolerance = 0.01; // Allow for small rounding differences
                    
                    testResult.annuityPassed = monthlyDiff <= tolerance && annualDiff <= tolerance;
                    
                    console.log('\nAnnuity Amounts:');
                    console.log('Expected:', {
                        monthly: formatCurrency(testCase.expected.annuity.monthly),
                        annual: formatCurrency(testCase.expected.annuity.annual)
                    });
                    console.log('Actual:', {
                        monthly: formatCurrency(annuityScenario.monthly),
                        annual: formatCurrency(annuityScenario.annual)
                    });
                    console.log('Annuity Status:', testResult.annuityPassed ? 'PASSED' : 'FAILED');
                }
            }

            // Check health insurance amounts if specified
            if (testCase.expected.health) {
                testResult.healthPassed = Object.keys(testCase.expected.health).every(coverageType => {
                    const expected = testCase.expected.health[coverageType];
                    const actual = results.health[coverageType];
                    
                    return Object.keys(expected).every(key => {
                        const diff = Math.abs(expected[key] - actual[key]);
                        return diff <= 0.01; // Allow for small rounding differences
                    });
                });

                console.log('\nHealth Insurance Amounts:');
                console.log('Expected:', {
                    fehb: {
                        monthly: formatCurrency(testCase.expected.health.fehb.monthly),
                        annual: formatCurrency(testCase.expected.health.fehb.annual),
                        biweekly: formatCurrency(testCase.expected.health.fehb.biweekly)
                    },
                    cobra: {
                        monthly: formatCurrency(testCase.expected.health.cobra.monthly),
                        annual: formatCurrency(testCase.expected.health.cobra.annual),
                        biweekly: formatCurrency(testCase.expected.health.cobra.biweekly)
                    }
                });
                console.log('Actual:', {
                    fehb: {
                        monthly: formatCurrency(results.health.fehb.monthly),
                        annual: formatCurrency(results.health.fehb.annual),
                        biweekly: formatCurrency(results.health.fehb.biweekly)
                    },
                    cobra: {
                        monthly: formatCurrency(results.health.cobra.monthly),
                        annual: formatCurrency(results.health.cobra.annual),
                        biweekly: formatCurrency(results.health.cobra.biweekly)
                    }
                });
                console.log('Health Insurance Status:', testResult.healthPassed ? 'PASSED' : 'FAILED');
            }
            
            if (!eligibilityPassed) {
                console.log('Retirement Scenarios:', results.retirementScenarios);
            }
            
            console.log('\n-------------------\n');
            
            testResults.push(testResult);
            
        } catch (error) {
            console.error('Test failed with error:', error);
            console.log('\n-------------------\n');
        }
    });

    return testResults;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
} 