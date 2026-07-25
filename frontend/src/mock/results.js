const mockResults = [
  {
    company: {
      name: "Antofagasta Minerals",
      website: "https://www.antofagasta.co.uk",
      industry: "Mining",
      country: "Chile",
      headquarters: "Santiago, Chile",
    },

    research: {
      summary:
        "Antofagasta Minerals is a leading copper mining company focused on operational efficiency, digital transformation, sustainability, and autonomous mining technologies.",

      recent_initiatives: [
        "Expanded autonomous haul truck operations.",
        "Investing heavily in predictive maintenance.",
        "Improving mine safety using AI."
      ],

      digital_transformation: [
        "IoT-enabled equipment monitoring.",
        "Cloud-based operational analytics.",
        "Real-time fleet monitoring dashboards."
      ],

      esg: [
        "Carbon neutrality roadmap.",
        "Water conservation initiatives.",
        "Renewable energy adoption."
      ],

      operational_challenges: [
        "Remote site operations.",
        "Equipment downtime.",
        "Worker safety.",
        "Inspection efficiency."
      ],

      interesting_facts: [
        "One of Chile's largest copper producers.",
        "Operates several world-class mines."
      ]
    },

    contacts: [
      {
        name: "Rene Aguilar",
        title: "Vice President of Strategy & Innovation",
        linkedin: "https://linkedin.com/in/rene-aguilar"
      },
      {
        name: "Antonio Velasquez Soza",
        title: "Operations Manager",
        linkedin: "https://linkedin.com/in/antonio-velasquez"
      }
    ],

    emails: [
      {
        contact: {
          name: "Rene Aguilar",
          title: "Vice President of Strategy & Innovation"
        },
        email: {
          subject:
            "Improving autonomous inspection workflows at Antofagasta",

          body: `Hi Rene,

I noticed Antofagasta's continued investment in autonomous mining and predictive maintenance.

FlytBase helps industrial organizations automate inspections using autonomous drones, reducing manual effort while improving safety and operational efficiency.

I'd love to show how companies are integrating drone automation into mining workflows.

Would you be open to a quick 20-minute conversation next week?

Best,
Akash`
        }
      }
    ],

    sources: [
      {
        title: "Antofagasta Sustainability Report",
        url: "https://www.antofagasta.co.uk"
      },
      {
        title: "Company Website",
        url: "https://www.antofagasta.co.uk"
      }
    ]
  }
];

export default mockResults;
