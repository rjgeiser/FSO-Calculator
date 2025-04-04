class Calculator {
    constructor(data) {
        this.data = data;
        this.age = parseInt(data['current-age']) || 0;
        this.yearsOfService = this.calculateYearsOfService();
        this.isTeraOffered = data['tera-eligible'] === 'yes';
        this.baseSalary = this.calculateBaseSalary();
        this.highThreeAverage = this.calculateHighThreeAverage();
    }

    calculateBaseSalary() {
        // For testing purposes, use a fixed salary
        return 100000;
    }

    calculateHighThreeAverage() {
        const year1 = parseInt(this.data['salary-year-1']) || this.baseSalary;
        const year2 = parseInt(this.data['salary-year-2']) || this.baseSalary;
        const year3 = parseInt(this.data['salary-year-3']) || this.baseSalary;
        return Math.round((year1 + year2 + year3) / 3);
    }

    calculateYearsOfService() {
        return parseInt(this.data['years-of-service']) || 0;
    }

    calculateMRA() {
        // Simplified MRA calculation for testing
        if (this.age >= 57) return 57;
        if (this.age >= 56) return 56;
        if (this.age >= 55) return 55;
        return 55; // Default to 55 for testing
    }

    isRegularRetirementEligible() {
        // Regular retirement requires either:
        // 1. Age 50+ with 20+ years of service, or
        // 2. Age 60+ with 5+ years of service
        return (this.age >= 50 && this.yearsOfService >= 20) || 
               (this.age >= 60 && this.yearsOfService >= 5);
    }

    isVeraEligible() {
        // VERA requires:
        // 1. Age 50+ with 15+ years of service
        // 2. VERA/TERA must be offered
        return this.age >= 50 && 
               this.yearsOfService >= 15 && 
               this.isTeraOffered;
    }

    isTeraEligible() {
        // TERA requires:
        // 1. 15+ years of service
        // 2. VERA/TERA must be offered
        // 3. Age < 50 (TERA is only available under age 50)
        return this.age < 50 && 
               this.yearsOfService >= 15 && 
               this.isTeraOffered;
    }

    isMraPlusTenEligible() {
        const mra = this.calculateMRA();
        // MRA+10 requires:
        // 1. Age >= MRA
        // 2. 10+ years of service
        return this.age >= mra && 
               this.yearsOfService >= 10;
    }

    isDeferredEligible() {
        // Deferred requires:
        // 1. 5+ years of service
        return this.yearsOfService >= 5;
    }

    calculateRegularAnnuity() {
        const baseMultiplier = 0.017;
        const annualAmount = this.highThreeAverage * this.yearsOfService * baseMultiplier;
        const annual = Math.round(annualAmount);
        const monthly = Math.round(annual / 12 * 100) / 100;
        
        return {
            monthly,
            annual,
            type: 'Regular',
            details: {
                calculation: {
                    formula: 'High-Three Average × Years of Service × 1.7%',
                    steps: [
                        `Annual Amount: $${this.highThreeAverage.toLocaleString()} × ${this.yearsOfService} × 0.017 = $${annualAmount.toLocaleString()}`,
                        `Rounded Annual: $${annual.toLocaleString()}`,
                        `Monthly Amount: $${annual.toLocaleString()} ÷ 12 = $${monthly.toLocaleString()}`
                    ]
                },
                notes: [
                    "No age reduction applied",
                    "Full annuity amount",
                    "Can begin immediately if eligible"
                ]
            }
        };
    }

    calculateVeraAnnuity() {
        const baseMultiplier = 0.017;
        const annualAmount = this.highThreeAverage * this.yearsOfService * baseMultiplier;
        const annual = Math.round(annualAmount);
        const monthly = Math.round(annual / 12 * 100) / 100;
        
        return {
            monthly,
            annual,
            type: 'VERA',
            details: {
                calculation: {
                    formula: 'High-Three Average × Years of Service × 1.7%',
                    steps: [
                        `Annual Amount: $${this.highThreeAverage.toLocaleString()} × ${this.yearsOfService} × 0.017 = $${annualAmount.toLocaleString()}`,
                        `Rounded Annual: $${annual.toLocaleString()}`,
                        `Monthly Amount: $${annual.toLocaleString()} ÷ 12 = $${monthly.toLocaleString()}`
                    ]
                },
                notes: [
                    "No age reduction applied",
                    "Full annuity amount",
                    "Requires VERA/TERA offering",
                    "Must be age 50 or older"
                ]
            }
        };
    }

    calculateTeraAnnuity() {
        const baseMultiplier = 0.017;
        const monthsUnder20 = Math.max(0, (20 * 12) - (this.yearsOfService * 12));
        const reduction = 1 - (monthsUnder20 * (0.01 * (1/12)));
        const annualAmount = this.highThreeAverage * this.yearsOfService * baseMultiplier * reduction;
        const annual = Math.round(annualAmount);
        const monthly = Math.round(annual / 12 * 100) / 100;
        
        return {
            monthly,
            annual,
            type: 'TERA',
            details: {
                calculation: {
                    formula: 'High-Three Average × Years of Service × 1.7% × (1 - (m × (0.01 × (1/12))))',
                    steps: [
                        `Months Under 20: ${monthsUnder20}`,
                        `Reduction Factor: 1 - (${monthsUnder20} × (0.01 × (1/12))) = ${reduction.toFixed(6)}`,
                        `Annual Amount: $${this.highThreeAverage.toLocaleString()} × ${this.yearsOfService} × 0.017 × ${reduction.toFixed(6)} = $${annualAmount.toLocaleString()}`,
                        `Rounded Annual: $${annual.toLocaleString()}`,
                        `Monthly Amount: $${annual.toLocaleString()} ÷ 12 = $${monthly.toLocaleString()}`
                    ]
                },
                notes: [
                    "Reduction factor = 1 - (months under 20 × (0.01 × (1/12)))",
                    "Requires VERA/TERA offering",
                    "Must be under age 50"
                ]
            }
        };
    }

    calculateMraPlusTenAnnuity() {
        const baseMultiplier = 0.017;
        const yearsUnder62 = Math.max(0, 62 - this.age);
        const reductionPercent = yearsUnder62 * 0.05;
        const effectiveMultiplier = baseMultiplier * (1 - reductionPercent);
        const annualAmount = this.highThreeAverage * this.yearsOfService * effectiveMultiplier;
        const annual = Math.round(annualAmount);
        const monthly = Math.round(annual / 12 * 100) / 100;
        
        return {
            monthly,
            annual,
            type: 'MRA+10',
            details: {
                calculation: {
                    formula: 'High-Three Average × Years of Service × (1.7% × (1 - Age Reduction))',
                    steps: [
                        `Years Under 62: ${yearsUnder62}`,
                        `Age Reduction: ${(reductionPercent * 100).toFixed(1)}%`,
                        `Effective Multiplier: ${(effectiveMultiplier * 100).toFixed(3)}%`,
                        `Annual Amount: $${this.highThreeAverage.toLocaleString()} × ${this.yearsOfService} × ${effectiveMultiplier.toFixed(4)} = $${annualAmount.toLocaleString()}`,
                        `Rounded Annual: $${annual.toLocaleString()}`,
                        `Monthly Amount: $${annual.toLocaleString()} ÷ 12 = $${monthly.toLocaleString()}`
                    ]
                },
                notes: [
                    "5% reduction per year under age 62",
                    "Reduction can be eliminated by waiting until age 62",
                    "Requires MRA+10 eligibility"
                ]
            }
        };
    }

    calculateDeferredAnnuity() {
        const baseMultiplier = 0.017;
        const annualAmount = this.highThreeAverage * this.yearsOfService * baseMultiplier;
        const annual = Math.round(annualAmount);
        const monthly = Math.round(annual / 12 * 100) / 100;
        
        return {
            monthly,
            annual,
            type: 'Deferred',
            details: {
                calculation: {
                    formula: 'High-Three Average × Years of Service × 1.7%',
                    steps: [
                        `Annual Amount: $${this.highThreeAverage.toLocaleString()} × ${this.yearsOfService} × 0.017 = $${annualAmount.toLocaleString()}`,
                        `Rounded Annual: $${annual.toLocaleString()}`,
                        `Monthly Amount: $${annual.toLocaleString()} ÷ 12 = $${monthly.toLocaleString()}`
                    ]
                },
                notes: [
                    "No age reduction applied",
                    "Can begin at age 62",
                    "High-three average is frozen at separation",
                    "Requires at least 5 years of service"
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
        
        // VERA - Check independently
        if (this.isVeraEligible()) {
            retirementScenarios.push(this.calculateVeraAnnuity());
        }
        
        // TERA - Check independently
        if (this.isTeraEligible()) {
            retirementScenarios.push(this.calculateTeraAnnuity());
        }

        // MRA+10
        if (this.isMraPlusTenEligible()) {
            retirementScenarios.push(this.calculateMraPlusTenAnnuity());
        }

        // Deferred
        if (this.isDeferredEligible()) {
            retirementScenarios.push(this.calculateDeferredAnnuity());
        }

        return {
            retirementScenarios,
            userInputs: {
                age: this.age,
                yearsOfService: this.yearsOfService,
                baseSalary: this.baseSalary,
                highThreeAverage: this.highThreeAverage,
                isTeraOffered: this.isTeraOffered,
                mra: this.calculateMRA()
            }
        };
    }

    // Test method to verify retirement calculations
    static testRetirementCalculations() {
        // Test Case 1: Regular Retirement Eligible
        const test1 = new Calculator({
            'current-age': '60',
            'years-of-service': '25',
            'fs-grade': 'FS-03',
            'fs-step': '10',
            'salary-year-1': '100000',
            'salary-year-2': '105000',
            'salary-year-3': '110000',
            'tera-eligible': 'no'
        });
        console.log('Test Case 1 - Regular Retirement Eligible:', test1.calculateAnnuity());

        // Test Case 2: MRA+10 Eligible
        const test2 = new Calculator({
            'current-age': '58',
            'years-of-service': '15',
            'fs-grade': 'FS-03',
            'fs-step': '10',
            'salary-year-1': '100000',
            'salary-year-2': '105000',
            'salary-year-3': '110000',
            'tera-eligible': 'no'
        });
        console.log('Test Case 2 - MRA+10 Eligible:', test2.calculateAnnuity());

        // Test Case 3: Deferred Eligible
        const test3 = new Calculator({
            'current-age': '45',
            'years-of-service': '8',
            'fs-grade': 'FS-03',
            'fs-step': '10',
            'salary-year-1': '100000',
            'salary-year-2': '105000',
            'salary-year-3': '110000',
            'tera-eligible': 'no'
        });
        console.log('Test Case 3 - Deferred Eligible:', test3.calculateAnnuity());

        // Test Case 4: VERA Eligible
        const test4 = new Calculator({
            'current-age': '50',
            'years-of-service': '20',
            'fs-grade': 'FS-03',
            'fs-step': '10',
            'salary-year-1': '100000',
            'salary-year-2': '105000',
            'salary-year-3': '110000',
            'tera-eligible': 'yes'
        });
        console.log('Test Case 4 - VERA Eligible:', test4.calculateAnnuity());

        // Test Case 5: TERA Eligible
        const test5 = new Calculator({
            'current-age': '45',
            'years-of-service': '15',
            'fs-grade': 'FS-03',
            'fs-step': '10',
            'salary-year-1': '100000',
            'salary-year-2': '105000',
            'salary-year-3': '110000',
            'tera-eligible': 'yes'
        });
        console.log('Test Case 5 - TERA Eligible:', test5.calculateAnnuity());
    }
} 