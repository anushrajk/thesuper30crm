export const STAGES = [
    { id: 'inquiry', title: '1. New Inquiry' },
    { id: 'requirements', title: '2. Requirement Gathering' },
    { id: 'proposal', title: '3. Proposal & Pitch' },
    { id: 'closing', title: '4. Pricing & Closing' },
    { id: 'closed', title: '5. Closed' },
];

export const INITIAL_CLIENTS = [
    {
        id: 'c1',
        name: 'TechFlow Systems',
        industry: 'SaaS',
        priority: 'High',
        health: 'On Track',
        projectStatus: 'ON TRACK 🟢',
        value: '₹5,000',
        owner: 'Sarah',
        stage: 'closed',
        lastActivity: '2h ago',
        portalEmail: 'rahul@techflow.com',
        portalPassword: 'password123',
        metrics: {
            performance: {
                leads: 42,
                spend: 4956,
                cpl: 118,
                qualified: 18,
                converted: 6
            },
            seo: {
                clicks: 1240,
                impressions: 18400,
                ctr: 6.7,
                avgPosition: 8.2
            }
        },
        reportStats: {
            leads: 38,
            spend: 4120,
            cpl: 108
        },
        services: ['seo', 'smo', 'content']
    },
    {
        id: 'c2',
        name: 'GreenEarth Organics',
        industry: 'E-commerce',
        priority: 'Medium',
        health: 'Needs Attention',
        projectStatus: 'NEEDS ATTENTION 🟡',
        value: '₹3,200',
        owner: 'Mike',
        stage: 'closed',
        lastActivity: '1d ago',
        portalEmail: 'jane@greenearth.com',
        portalPassword: 'password123',
        metrics: {
            performance: {
                leads: 12,
                spend: 1500,
                cpl: 125,
                qualified: 5,
                converted: 2
            },
            seo: {
                clicks: 850,
                impressions: 12000,
                ctr: 7.1,
                avgPosition: 12.5
            }
        },
        reportStats: {
            leads: 12,
            spend: 1500,
            cpl: 125
        },
        services: ['seo', 'design']
    },
    {
        id: 'c3',
        name: 'Apex Consulting',
        industry: 'Professional Services',
        priority: 'High',
        health: 'At Risk',
        projectStatus: 'AT RISK 🔴',
        value: '₹8,500',
        owner: 'Sarah',
        stage: 'closed',
        lastActivity: '5m ago',
        portalEmail: 'mark@apex.com',
        portalPassword: 'password123',
        metrics: {
            performance: {
                leads: 5,
                spend: 2000,
                cpl: 400,
                qualified: 1,
                converted: 0
            },
            seo: {
                clicks: 320,
                impressions: 5000,
                ctr: 6.4,
                avgPosition: 15.2
            }
        },
        reportStats: {
            leads: 5,
            spend: 2000,
            cpl: 400
        },
        services: ['seo', 'smo', 'pm', 'content', 'design', 'dev', 'other']
    },
    {
        id: 'c4',
        name: 'BlueWave Logistics',
        industry: 'Logistics',
        priority: 'Low',
        health: 'On Track',
        projectStatus: 'ON TRACK 🟢',
        value: '₹2,000',
        owner: 'Jasmine',
        stage: 'inquiry',
        lastActivity: '3h ago',
        portalEmail: 'steve@bluewave.com',
        portalPassword: 'password123',
        metrics: {
            performance: {
                leads: 0,
                spend: 0,
                cpl: 0,
                qualified: 0,
                converted: 0
            },
            seo: {
                clicks: 0,
                impressions: 0,
                ctr: 0,
                avgPosition: 0
            }
        },
        reportStats: {
            leads: 0,
            spend: 0,
            cpl: 0
        },
        services: ['seo']
    },
];
