class Calculator {
    constructor(data) {
        this.data = data;
        this.age = parseInt(data['current-age']) || 0;
        this.yearsOfService = this.calculateYearsOfService();
        this.isTeraOffered = data['tera-eligible'] === 'yes';
        this.teraYears = parseInt(data['tera-years']) || 0;
        this.teraAge = parseInt(data['tera-age']) || 0;
        this.fsGrade = data['fs-grade'];
        this.fsStep = parseInt(data['fs-step']) || 0;
        
        // Health insurance fields
        this.currentPlan = data['current-plan'] || 'BCBS-basic';
        this.coverageType = data['coverage-type'] || 'self';
        this.homeState = data['state'] || 'DC';
        
        // Coverage type mapping (form values to display values)
        this.coverageTypeMap = {
            'self': 'Self',
            'self-plus-one': 'Self Plus One',
            'family': 'Self and Family'
        };
        
        this.baseSalary = this.calculateBaseSalary();
        this.highThreeAverage = this.calculateHighThreeAverage();
        this.monthsOfService = this.yearsOfService * 12;
        
        // Use the early retirement fields if V/TERA is offered
        if (this.isTeraOffered) {
            this.earlyRetirementYears = this.teraYears || this.yearsOfService;
            this.earlyRetirementAge = this.teraAge || this.age;
        } else {
            this.earlyRetirementYears = this.yearsOfService;
            this.earlyRetirementAge = this.age;
        }
        this.earlyRetirementMonths = this.earlyRetirementYears * 12;
    }

    calculateBaseSalary() {
        // Base salary lookup based on grade and step
        const grade = this.data['fs-grade'];
        const step = this.data['fs-step'];
        
        // 2025 Foreign Service Base Salary Table
        const baseSalaries = {
            'SFS': {
                'FE-CM': [172100, 177263, 182526, 187889, 193356, 198930, 204610, 210400, 216300, 222330, 228490, 234780, 241210, 247780],
                'FE-MC': [172100, 177263, 182526, 187889, 193356, 198930, 204610, 210400, 216300, 222330, 228490, 234780, 241210, 247780],
                'FE-OC': [172100, 177263, 182526, 187889, 193356, 198930, 204610, 210400, 216300, 222330, 228490, 234780, 241210, 247780]
            },
            'FS-01': [115506, 118971, 122540, 126216, 130002, 133902, 137919, 142057, 146319, 150709, 155230, 159887, 164684, 169625],
            'FS-02': [93967, 96786, 99690, 102681, 105761, 108934, 112202, 115568, 119035, 122606, 126284, 130073, 133975, 137994],
            'FS-03': [76570, 78867, 81233, 83670, 86180, 88765, 91428, 94171, 96996, 99906, 102903, 105990, 109170, 112445],
            'FS-04': [62468, 64342, 66272, 68260, 70308, 72417, 74590, 76828, 79133, 81507, 83952, 86471, 89065, 91737]
        };

        let baseSalary = 0;

        // For SFS grades, use the selected step (FE-CM, FE-MC, or FE-OC)
        if (grade === 'SFS') {
            // Default to FE-OC if no valid step is selected
            const sfsStep = baseSalaries[grade][step] ? step : 'FE-OC';
            // For SFS, we'll use the first salary in the array as they're all the same
            baseSalary = baseSalaries[grade][sfsStep][0];
        } else {
            // For regular FS grades, convert step to zero-based index
            const stepIndex = parseInt(step) - 1;
            baseSalary = baseSalaries[grade]?.[stepIndex] || 0;
        }

        // Apply DC locality rate (33.94%)
        return Math.round(baseSalary * (1 + FSO_DATA.location.localityRate));
    }

    calculateHighThreeAverage() {
        const year1 = parseInt(this.data['salary-year-1']) || this.baseSalary;
        const year2 = parseInt(this.data['salary-year-2']) || this.baseSalary;
        const year3 = parseInt(this.data['salary-year-3']) || this.baseSalary;
        
        return Math.round((year1 + year2 + year3) / 3 * 100) / 100;
    }

    calculateYearsOfService() {
        // If SCD is provided, use it to calculate years
        const scd = this.data['service-computation-date'];
        if (scd) {
            const scdDate = new Date(scd);
            const today = new Date();
            const years = (today - scdDate) / (1000 * 60 * 60 * 24 * 365.25);
            return Math.floor(years);
        }
        
        // Otherwise use the dropdown value
        return parseInt(this.data['years-of-service']) || 0;
    }

    calculateSeverance() {
        // Calculate monthly base pay
        const monthlyBase = this.baseSalary / 12;
        
        // Calculate total severance (one month per year of service)
        let totalSeverance = monthlyBase * this.yearsOfService;
        
        // Limit to one year's salary
        totalSeverance = Math.min(totalSeverance, this.baseSalary);
        
        // Calculate installments (paid over three consecutive years)
        const currentYear = new Date().getFullYear();
        const installmentAmount = totalSeverance / 3;
        
        return {
            total: totalSeverance,
            details: {
                baseSalary: this.baseSalary,
                monthlyBase: monthlyBase,
                yearsOfService: this.yearsOfService,
                calculation: {
                    formula: 'Monthly Base Pay × Years of Service (capped at one year)',
                    steps: [
                        `Monthly Base: $${this.baseSalary.toLocaleString()} ÷ 12 = $${monthlyBase.toLocaleString()}`,
                        `Initial Severance: $${monthlyBase.toLocaleString()} × ${this.yearsOfService} = $${(monthlyBase * this.yearsOfService).toLocaleString()}`,
                        `Capped Amount: $${totalSeverance.toLocaleString()}`
                    ]
                },
                installments: [
                    { year: currentYear, amount: installmentAmount },
                    { year: currentYear + 1, amount: installmentAmount },
                    { year: currentYear + 2, amount: installmentAmount }
                ],
                notes: [
                    "Based on Foreign Service Pension System (FSPS) formula",
                    "One month's pay for each year of service",
                    "Capped at one year's salary",
                    "Paid in three equal installments on January 1st"
                ],
                citations: [
                    "3 FAM 6110 - Foreign Service Pension System",
                    "3 FAM 6112 - Computation of Basic Annuity"
                ]
            }
        };
    }

    calculateAnnuity() {
        const retirementScenarios = [];
        
        // Regular Retirement
        if (this.isRegularRetirementEligible()) {
            retirementScenarios.push(this.calculateRegularAnnuity());
        }
        
        // VERA
        if (this.isVeraEligible() && this.isTeraOffered) {
            retirementScenarios.push(this.calculateVeraAnnuity());
        }
        
        // TERA
        if (this.isTeraEligible() && this.isTeraOffered) {
            retirementScenarios.push(this.calculateTeraAnnuity());
        }

        return {
            retirementScenarios,
            userInputs: {
                age: this.age,
                yearsOfService: this.yearsOfService,
                baseSalary: this.baseSalary,
                highThreeAverage: this.highThreeAverage,
                isTeraOffered: this.isTeraOffered
            }
        };
    }

    calculateRegularAnnuity() {
        const baseMultiplier = 0.017; // 1.7% base rate
        
        // Calculate annual amount first with full precision
        const annualAmount = this.highThreeAverage * this.yearsOfService * baseMultiplier;
        // Round annual to nearest dollar
        const annual = Math.round(annualAmount);
        
        // Calculate monthly by dividing annual by 12 and rounding to 2 decimal places
        const monthly = Math.round(annual / 12 * 100) / 100;
        
        return {
            monthly,
            annual,
            type: 'Regular',
            details: {
                multiplier: baseMultiplier,
                yearsOfService: this.yearsOfService,
                highThreeAverage: this.highThreeAverage,
                noReduction: true,
                calculation: {
                    formula: 'High-Three Average × Years of Service × 1.7%',
                    steps: [
                        `Annual Amount: $${this.highThreeAverage.toLocaleString()} × ${this.yearsOfService} × 0.017 = $${annualAmount.toLocaleString()}`,
                        `Rounded Annual: $${annual.toLocaleString()}`,
                        `Monthly Amount: $${annual.toLocaleString()} ÷ 12 = $${monthly.toLocaleString()}`
                    ]
                },
                notes: [
                    "Based on Foreign Service Pension System (FSPS) formula",
                    "No reduction applied for regular retirement",
                    "Annual amount rounded to nearest dollar before calculating monthly amount"
                ],
                citations: [
                    "3 FAM 6110 - Foreign Service Pension System",
                    "3 FAM 6112 - Computation of Basic Annuity"
                ]
            }
        };
    }

    calculateVeraAnnuity() {
        const baseMultiplier = 0.017; // 1.7% base rate
        
        // Calculate annual amount first with full precision
        const annualAmount = this.highThreeAverage * this.earlyRetirementYears * baseMultiplier;
        // Round annual to nearest dollar
        const annual = Math.round(annualAmount);
        
        // Calculate monthly by dividing annual by 12 and rounding to 2 decimal places
        const monthly = Math.round(annual / 12 * 100) / 100;
        
        return {
            monthly,
            annual,
            type: 'VERA',
            details: {
                multiplier: baseMultiplier,
                yearsOfService: this.earlyRetirementYears,
                highThreeAverage: this.highThreeAverage,
                noReduction: true,
                calculation: {
                    formula: 'High-Three Average × Early Retirement Years × 1.7%',
                    steps: [
                        `Annual Amount: $${this.highThreeAverage.toLocaleString()} × ${this.earlyRetirementYears} × 0.017 = $${annualAmount.toLocaleString()}`,
                        `Rounded Annual: $${annual.toLocaleString()}`,
                        `Monthly Amount: $${annual.toLocaleString()} ÷ 12 = $${monthly.toLocaleString()}`
                    ]
                },
                notes: [
                    "Based on Voluntary Early Retirement Authority (VERA) formula",
                    "No reduction applied for VERA retirement",
                    "Uses early retirement years instead of total years of service",
                    "Annual amount rounded to nearest dollar before calculating monthly amount"
                ],
                citations: [
                    "3 FAM 6110 - Foreign Service Pension System",
                    "3 FAM 6112 - Computation of Basic Annuity",
                    "3 FAM 6113 - Voluntary Early Retirement"
                ]
            }
        };
    }

    calculateTeraAnnuity() {
        const baseMultiplier = 0.017; // 1.7% base rate
        
        // Calculate years under 20 and apply 10% reduction for 5 years under
        const yearsUnder20 = Math.max(0, 20 - this.yearsOfService);
        const reductionPercent = yearsUnder20 * 0.02; // 2% per year under 20
        const effectiveMultiplier = baseMultiplier * (1 - reductionPercent);
        
        // Calculate annual amount first with full precision
        const annualAmount = this.highThreeAverage * this.yearsOfService * effectiveMultiplier;
        // Round annual to nearest dollar
        const annual = Math.round(annualAmount);
        
        // Calculate monthly by dividing annual by 12 and rounding to 2 decimal places
        const monthly = Math.round(annual / 12 * 100) / 100;
        
        return {
            monthly,
            annual,
            type: 'TERA',
            details: {
                baseMultiplier,
                yearsUnder20,
                reductionPercent,
                effectiveMultiplier,
                yearsOfService: this.yearsOfService,
                highThreeAverage: this.highThreeAverage,
                calculation: {
                    formula: 'High-Three Average × Years of Service × (1.7% × (1 - Reduction))',
                    steps: [
                        `Years Under 20: ${yearsUnder20}`,
                        `Reduction: ${(reductionPercent * 100).toFixed(1)}%`,
                        `Effective Multiplier: ${(effectiveMultiplier * 100).toFixed(3)}%`,
                        `Annual Amount: $${this.highThreeAverage.toLocaleString()} × ${this.yearsOfService} × ${effectiveMultiplier.toFixed(4)} = $${annualAmount.toLocaleString()}`,
                        `Rounded Annual: $${annual.toLocaleString()}`,
                        `Monthly Amount: $${annual.toLocaleString()} ÷ 12 = $${monthly.toLocaleString()}`
                    ]
                },
                notes: [
                    "Based on Temporary Early Retirement Authority (TERA) formula",
                    "2% reduction per year under 20 years of service",
                    "Maximum reduction of 10% for 5 years under 20",
                    "Annual amount rounded to nearest dollar before calculating monthly amount"
                ],
                citations: [
                    "3 FAM 6110 - Foreign Service Pension System",
                    "3 FAM 6112 - Computation of Basic Annuity",
                    "3 FAM 6114 - Temporary Early Retirement Authority"
                ]
            }
        };
    }

    calculateHealthInsurance() {
        const coverageType = this.data['coverage-type'];
        const currentPlan = this.data['current-plan'];
        const state = this.data.state;
        
        // Get current plan details
        const planDetails = this.getPlanDetails(currentPlan, coverageType);
        
        // Calculate total monthly contribution (employee + employer)
        const employeeContribution = planDetails.monthly;
        const employerContribution = this.getEmployerContribution(planDetails.monthly);
        const totalMonthlyContribution = employeeContribution + employerContribution;
        
        // Calculate COBRA costs (102% of total contribution)
        const cobraMonthly = totalMonthlyContribution * 1.02;
        const cobraDuration = 18; // Standard COBRA duration in months
        
        // Calculate ACA Marketplace costs based on total contribution
        const acaMonthly = this.calculateACAPremium(totalMonthlyContribution, state);
        const acaPlanName = this.getEquivalentACAPlan(currentPlan);
        
        // Calculate annual costs
        const cobraAnnual = cobraMonthly * 12;
        const acaAnnual = acaMonthly * 12;
        
        // Calculate total costs
        const cobraTotalCost = cobraMonthly * cobraDuration;
        const acaTotalCost = acaAnnual;
        
        return {
            coverageType,
            planName: currentPlan,
            cobra: {
                monthly: cobraMonthly,
                annual: cobraAnnual,
                duration: cobraDuration,
                totalCost: cobraTotalCost
            },
            aca: {
                monthly: acaMonthly,
                annual: acaAnnual,
                planName: acaPlanName,
                totalCost: acaTotalCost
            },
            details: {
                acaCalculation: {
                    formula: "Monthly Premium = (Employee + Employer Contribution) × State Factor",
                    steps: [
                        `Employee Contribution: ${formatCurrency(employeeContribution)}`,
                        `Employer Contribution: ${formatCurrency(employerContribution)}`,
                        `Total Contribution: ${formatCurrency(totalMonthlyContribution)}`,
                        `State Factor: ${this.getStateFactor(state)}`,
                        `Final Monthly Premium: ${formatCurrency(acaMonthly)}`
                    ]
                },
                cobraCalculation: {
                    formula: "Monthly Premium = (Employee + Employer Contribution) × 1.02",
                    steps: [
                        `Employee Contribution: ${formatCurrency(employeeContribution)}`,
                        `Employer Contribution: ${formatCurrency(employerContribution)}`,
                        `Total Contribution: ${formatCurrency(totalMonthlyContribution)}`,
                        `COBRA Fee (2%): ${formatCurrency(totalMonthlyContribution * 0.02)}`,
                        `Final Monthly Premium: ${formatCurrency(cobraMonthly)}`
                    ]
                },
                notes: [
                    "These estimates are based on comparable coverage options for your current enrollment type and coverage level.",
                    "COBRA coverage is available for 18 months after separation",
                    "ACA Marketplace plans are available year-round with special enrollment period",
                    "Premiums may be eligible for tax credits based on income",
                    this.getStateFactorExplanation(state)
                ],
                citations: [
                    "COBRA: 29 U.S.C. § 1161 et seq.",
                    "ACA Marketplace: 42 U.S.C. § 18031 et seq."
                ]
            }
        };
    }

    calculateACAPremium(totalContribution, state) {
        // Get state-specific factor only
        const stateFactor = this.getStateFactor(state);
        
        // Calculate ACA premium based on total contribution and state factor only
        return totalContribution * stateFactor;
    }

    getEmployerContribution(employeeContribution) {
        // Employer typically contributes 75% of the total premium
        // This is a simplified calculation - actual rates may vary
        return employeeContribution * 3; // If employee pays 25%, employer pays 75%
    }

    getStateFactor(state) {
        // State-specific factors for ACA premiums
        const stateFactors = {
            'CA': 1.05,
            'NY': 1.08,
            'TX': 0.98,
            // Add more states as needed
        };
        return stateFactors[state] || 1.0;
    }

    getEquivalentACAPlan(currentPlan) {
        // Map current plan to equivalent ACA plan
        const planMapping = {
            'BCBS-basic': 'Blue Cross Blue Shield Basic',
            'FSBP-standard': 'Foreign Service Benefit Plan Standard',
            'AETNA-direct': 'Aetna Direct',
            'GEHA-standard': 'GEHA Standard',
            'Compass Rose': 'Compass Rose Standard'
        };
        return planMapping[currentPlan] || 'Equivalent Marketplace Plan';
    }

    calculateAllBenefits() {
        const severance = this.calculateSeverance();
        const health = this.calculateHealthInsurance();
        const annuity = this.calculateAnnuity();
        
        // Calculate service duration details
        const serviceDuration = this.calculateServiceDuration();
        const sickLeaveService = this.calculateSickLeaveService();
        const totalService = {
            years: serviceDuration.years + (sickLeaveService?.years || 0),
            months: serviceDuration.months + (sickLeaveService?.months || 0),
            days: serviceDuration.days + (sickLeaveService?.days || 0)
        };
        
        return {
            severance,
            health,
            retirementScenarios: annuity.retirementScenarios,
            userInputs: annuity.userInputs,
            serviceDetails: {
                serviceDuration,
                sickLeaveService,
                totalService,
                mra: this.calculateMRA(),
                highThreeAverage: {
                    amount: this.highThreeAverage,
                    calculation: {
                        formula: '(Year 1 + Year 2 + Year 3) ÷ 3',
                        steps: [
                            `Year 1: $${this.data['salary-year-1']?.toLocaleString() || this.baseSalary.toLocaleString()}`,
                            `Year 2: $${this.data['salary-year-2']?.toLocaleString() || this.baseSalary.toLocaleString()}`,
                            `Year 3: $${this.data['salary-year-3']?.toLocaleString() || this.baseSalary.toLocaleString()}`,
                            `Average: $${this.highThreeAverage.toLocaleString()}`
                        ]
                    }
                },
                notes: [
                    "Sick leave is only included in service calculation if immediate retirement is available (Regular, VERA, or TERA)",
                    "Sick leave hours are converted to days and rounded to the nearest month",
                    "Days are not included in the final calculation as they are rounded to months"
                ]
            }
        };
    }

    calculateServiceDuration() {
        const scd = this.data['service-computation-date'];
        if (!scd) {
            return {
                years: this.yearsOfService,
                months: 0,
                days: 0
            };
        }

        const scdDate = new Date(scd);
        const today = new Date();
        const diffTime = Math.abs(today - scdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        const years = Math.floor(diffDays / 365.25);
        let remainingDays = diffDays - (years * 365.25);
        const months = Math.floor(remainingDays / 30.44);
        remainingDays = Math.floor(remainingDays - (months * 30.44));
        
        return {
            years,
            months,
            days: remainingDays
        };
    }

    calculateSickLeaveService() {
        const sickLeaveHours = parseInt(this.data['sick-leave-balance']) || 0;
        if (sickLeaveHours === 0) return null;

        // Only include sick leave if immediate retirement is available
        if (!this.isRegularRetirementEligible() && !this.isVeraEligible() && !this.isTeraEligible()) {
            return null;
        }

        // Convert hours to days and round to nearest month
        const days = sickLeaveHours / 8;
        const months = Math.round(days / 30.44); // Round to nearest month

        // Convert months to years and remaining months
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        return {
            years,
            months: remainingMonths,
            days: 0 // Days are rounded to months
        };
    }

    calculateMRA() {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - this.age;
        
        if (birthYear <= 1947) return 55;
        if (birthYear >= 1970) return 57;
        
        const yearsSince1947 = birthYear - 1947;
        const additionalMonths = yearsSince1947 * 2;
        return 55 + (additionalMonths / 12);
    }

    isRegularRetirementEligible() {
        // Regular retirement requires either:
        // 1. Age 50+ AND 20+ years of service, OR
        // 2. Age 60+ AND 5+ years of service
        return (this.age >= 50 && this.yearsOfService >= 20) || 
               (this.age >= 60 && this.yearsOfService >= 5);
    }

    isVeraEligible() {
        // VERA requires age 43+ AND 15+ years of service
        return this.earlyRetirementAge >= 43 && this.earlyRetirementYears >= 15;
    }

    isTeraEligible() {
        if (!this.isTeraOffered) return false;
        
        // TERA requires 15+ years of service
        return this.yearsOfService >= 15;
    }

    getPlanDetails(plan, coverageType) {
        // Hardcoded rates for testing
        const rates = {
            'BCBS-basic': {
                'self': {
                    biweekly: 75.50,
                    monthly: 163.58
                },
                'self-plus-one': {
                    biweekly: 167.50,
                    monthly: 362.92
                },
                'family': {
                    biweekly: 175.50,
                    monthly: 380.25
                }
            },
            'FSBP-standard': {
                'self': {
                    biweekly: 82.50,
                    monthly: 178.75
                },
                'self-plus-one': {
                    biweekly: 175.50,
                    monthly: 380.25
                },
                'family': {
                    biweekly: 185.50,
                    monthly: 401.92
                }
            },
            'AETNA-direct': {
                'self': {
                    biweekly: 78.50,
                    monthly: 170.08
                },
                'self-plus-one': {
                    biweekly: 165.50,
                    monthly: 358.58
                },
                'family': {
                    biweekly: 175.50,
                    monthly: 380.25
                }
            },
            'GEHA-standard': {
                'self': {
                    biweekly: 72.50,
                    monthly: 157.08
                },
                'self-plus-one': {
                    biweekly: 155.50,
                    monthly: 336.92
                },
                'family': {
                    biweekly: 165.50,
                    monthly: 358.58
                }
            },
            'Compass Rose': {
                'self': {
                    biweekly: 85.50,
                    monthly: 185.25
                },
                'self-plus-one': {
                    biweekly: 180.50,
                    monthly: 391.08
                },
                'family': {
                    biweekly: 190.50,
                    monthly: 412.75
                }
            }
        };

        // Get the plan rates for the selected coverage type
            const planRates = rates[plan]?.[coverageType];
            if (!planRates) {
            console.error('No rates found for:', { plan, coverageType });
                throw new Error(`No rates found for plan ${plan} with coverage type ${coverageType}`);
        }

        return {
            biweekly: planRates.biweekly,
            monthly: planRates.monthly
        };
    }

    getStateFactorExplanation(state) {
        const stateExplanations = {
            'CA': `For California (state factor 1.05): The state factor of 1.05 means ACA Marketplace premiums in California are estimated to be 5% higher than the federal employee plan premium due to higher healthcare costs in metropolitan areas and higher cost of living.`,
            'NY': `For New York (state factor 1.08): The state factor of 1.08 means ACA Marketplace premiums in New York are estimated to be 8% higher than the federal employee plan premium due to higher healthcare costs in metropolitan areas and state-specific insurance regulations.`,
            'TX': `For Texas (state factor 0.98): The state factor of 0.98 means ACA Marketplace premiums in Texas are estimated to be 2% lower than the federal employee plan premium due to lower healthcare costs from a competitive market and lower cost of living.`,
            'DC': `For District of Columbia (state factor 1.00): The state factor of 1.00 means ACA Marketplace premiums in DC are estimated to be equal to the federal employee plan premium, reflecting standard market rates for the region.`
        };
        return stateExplanations[state] || `For ${state} (state factor 1.00): The state factor of 1.00 means ACA Marketplace premiums in ${state} are estimated to be equal to the federal employee plan premium, reflecting standard market rates for the region.`;
    }
} 