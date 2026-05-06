export const INITIAL_TEAM = [
    {
        id: 'u1',
        name: 'Sarah Jenkins',
        role: 'Account Manager',
        avatar: 'SJ',
        email: 'sarah@agencyos.com',
        status: 'Active',
        skills: ['Client Relations', 'Strategy', 'Project Management'],
        color: '#6366f1',
        type: 'agency',
        roleType: 'super_admin'
    },
    {
        id: 'u2',
        name: 'Mike Ross',
        role: 'SEO Specialist',
        avatar: 'MR',
        email: 'mike@agencyos.com',
        status: 'Active',
        skills: ['Backlinks', 'Technical SEO', 'Keyword Research'],
        color: '#10b981',
        type: 'agency',
        roleType: 'admin'
    },
    {
        id: 'u3',
        name: 'Jasmine Lee',
        role: 'Developer',
        avatar: 'JL',
        email: 'jasmine@agencyos.com',
        status: 'Active',
        skills: ['React', 'Next.js', 'API Integration'],
        color: '#f59e0b',
        type: 'agency',
        roleType: 'editor',
        reportsTo: 'u2'
    },
    {
        id: 'u4',
        name: 'Alex Rivera',
        role: 'Designer',
        avatar: 'AR',
        email: 'alex@agencyos.com',
        status: 'Active',
        skills: ['UI/UX', 'Figma', 'Branding'],
        color: '#ec4899',
        type: 'agency',
        roleType: 'editor',
        reportsTo: 'u2'
    },
    {
        id: 'u5',
        name: 'David Chen',
        role: 'Ads Executive',
        avatar: 'DC',
        email: 'david@agencyos.com',
        status: 'On Leave',
        skills: ['Meta Ads', 'Google Ads', 'Copywriting'],
        color: '#06b6d4',
        type: 'agency',
        roleType: 'editor',
        reportsTo: 'u1'
    },
    {
        id: 'c-u1',
        name: 'Rahul Mehta',
        role: 'Client Admin',
        avatar: 'RM',
        email: 'rahul@techflow.com',
        status: 'Active',
        type: 'client',
        clientId: 'c1',
        color: '#6366f1',
        roleType: 'client'
    }
];
