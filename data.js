// Define the base salary data
const BASE_SALARIES = [
    // FS-04 (all steps)
    62468, 64342, 66272, 68260, 70308, 72417, 74590, 76828, 79133, 81507, 83952, 86471, 89065, 91737,
    // FS-03 (all steps)
    76570, 78867, 81233, 83670, 86180, 88765, 91428, 94171, 96996, 99906, 102903, 105990, 109170, 112445,
    // FS-02 (all steps)
    93967, 96786, 99690, 102681, 105761, 108934, 112202, 115568, 119035, 122606, 126284, 130073, 133975, 137994,
    // FS-01 (all steps)
    115506, 118971, 122540, 126216, 130002, 133902, 137919, 142057, 146319, 150709, 155230, 159887, 164684, 169625,
    // SFS (all steps)
    172100, 177263, 182526, 187889, 193356, 198930, 204610, 210400, 216300, 222330, 228490, 234780, 241210, 247780
];

// Function to calculate salary ranges with locality pay
function calculateSalaryRanges(localityRate) {
    // Apply locality rate
    const localitySalaries = BASE_SALARIES.map(salary => 
        Math.round(salary * (1 + localityRate))
    );

    // Remove duplicates and sort in ascending order
    const uniqueSalaries = [...new Set(localitySalaries)].sort((a, b) => a - b);
    
    return uniqueSalaries.map(salary => ({
        value: salary.toString(),
        label: `$${salary.toLocaleString()}`
    }));
}

const FSO_DATA = {
    grades: [
        { value: 'SFS', label: 'Senior Foreign Service' },
        { value: 'FS-01', label: 'FS-01' },
        { value: 'FS-02', label: 'FS-02' },
        { value: 'FS-03', label: 'FS-03' },
        { value: 'FS-04', label: 'FS-04' }
    ],
    regularSteps: Array.from({ length: 14 }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString()
    })),
    sfsSteps: [
        { value: 'FE-CM', label: 'Career Minister (FE-CM)' },
        { value: 'FE-MC', label: 'Minister Counselor (FE-MC)' },
        { value: 'FE-OC', label: 'Counselor (FE-OC)' }
    ],
    getSteps: function(grade) {
        return grade === 'SFS' ? this.sfsSteps : this.regularSteps;
    },
    ages: Array.from({ length: 56 }, (_, i) => ({
        value: (i + 25).toString(),
        label: (i + 25).toString()
    })),
    yearsOfService: Array.from({ length: 40 }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString()
    })),
    location: {
        value: 'WDC',
        label: 'Washington, DC',
        localityRate: 0.3394 // 33.94% locality rate
    },
    healthPlans: [
        { value: 'BCBS-basic', label: 'BCBS Basic' },
        { value: 'FSBP-standard', label: 'Foreign Service Benefit Plan' },
        { value: 'AETNA-direct', label: 'Aetna Direct' },
        { value: 'GEHA-standard', label: 'GEHA Standard' },
        { value: 'Compass Rose', label: 'Compass Rose' }
    ],
    coverageTypes: [
        { value: 'self', label: 'Self Only' },
        { value: 'self-plus-one', label: 'Self Plus One' },
        { value: 'family', label: 'Self and Family' }
    ],
    states: [
        { value: 'AL', label: 'Alabama' },
        { value: 'AK', label: 'Alaska' },
        { value: 'AZ', label: 'Arizona' },
        { value: 'AR', label: 'Arkansas' },
        { value: 'CA', label: 'California' },
        { value: 'CO', label: 'Colorado' },
        { value: 'CT', label: 'Connecticut' },
        { value: 'DE', label: 'Delaware' },
        { value: 'DC', label: 'District of Columbia' },
        { value: 'FL', label: 'Florida' },
        { value: 'GA', label: 'Georgia' },
        { value: 'HI', label: 'Hawaii' },
        { value: 'ID', label: 'Idaho' },
        { value: 'IL', label: 'Illinois' },
        { value: 'IN', label: 'Indiana' },
        { value: 'IA', label: 'Iowa' },
        { value: 'KS', label: 'Kansas' },
        { value: 'KY', label: 'Kentucky' },
        { value: 'LA', label: 'Louisiana' },
        { value: 'ME', label: 'Maine' },
        { value: 'MD', label: 'Maryland' },
        { value: 'MA', label: 'Massachusetts' },
        { value: 'MI', label: 'Michigan' },
        { value: 'MN', label: 'Minnesota' },
        { value: 'MS', label: 'Mississippi' },
        { value: 'MO', label: 'Missouri' },
        { value: 'MT', label: 'Montana' },
        { value: 'NE', label: 'Nebraska' },
        { value: 'NV', label: 'Nevada' },
        { value: 'NH', label: 'New Hampshire' },
        { value: 'NJ', label: 'New Jersey' },
        { value: 'NM', label: 'New Mexico' },
        { value: 'NY', label: 'New York' },
        { value: 'NC', label: 'North Carolina' },
        { value: 'ND', label: 'North Dakota' },
        { value: 'OH', label: 'Ohio' },
        { value: 'OK', label: 'Oklahoma' },
        { value: 'OR', label: 'Oregon' },
        { value: 'PA', label: 'Pennsylvania' },
        { value: 'RI', label: 'Rhode Island' },
        { value: 'SC', label: 'South Carolina' },
        { value: 'SD', label: 'South Dakota' },
        { value: 'TN', label: 'Tennessee' },
        { value: 'TX', label: 'Texas' },
        { value: 'UT', label: 'Utah' },
        { value: 'VT', label: 'Vermont' },
        { value: 'VA', label: 'Virginia' },
        { value: 'WA', label: 'Washington' },
        { value: 'WV', label: 'West Virginia' },
        { value: 'WI', label: 'Wisconsin' },
        { value: 'WY', label: 'Wyoming' }
    ]
};

// Initialize salary ranges after FSO_DATA is defined
FSO_DATA.salaryRanges = calculateSalaryRanges(FSO_DATA.location.localityRate);