export const en = {
  auth: {
    signIn: "Sign in",
    signInSubtitle: "Welcome back"
  },
  common: {
    yes: "Yes",
    no: "No",
    search: "Search...",
    viewAll: "View all",
    cancel: "Cancel",
    calendar: {
      title: "Calendar",
      upcomingEvents: "Upcoming Events"
    },
    menu: {
      home: "Home",
      users: "Users",
      attendance: "Attendance", 
      events: "Events",
      library: "Library",
      messages: "Messages",
      announcements: "Announcements",
      videoCommunication: "Video Communication",
      todoList: "To do List",
      resources: "Resources",
      calculator: "Salary Calculator",
      energy: "Energy Prices",
      guide: "Guide",
      shared: "Shared Files",
      financing: "Financing",
    }
  },
    calculator: {
      title: "Salary Calculator",
      contractTypes: {
        employment: "Employment Contract",
        contract: "Mandate Contract",
        work: "Contract Work",
        b2b: "B2B Contract"
      },
      fields: {
        workTime: {
          label: "What are your working hours?",
          options: {
            full: "full time",
            threeQuarters: "3/4 time",
            half: "1/2 time",
            quarter: "1/4 time"
          }
        },
        workFromHome: "Do you work from home?",
        under26: "I am under 26 years old",
        zusPayment: {
          title: "Select option:",
          thisEmployer: "I pay ZUS with this employer",
          otherEmployer: "I pay ZUS with another employer"
        },
        isStudent: "I am a student",
        costOptions: {
          title: "Tax deductible expenses:",
          twenty: "20%",
          fifty: "50%"
        },
        zusType: {
          title: "ZUS contribution:",
          none: "No ZUS contribution (\"start-up relief\")",
          noneDescription: "First six months without ZUS",
          preferential: "Preferential ZUS contribution",
          preferentialDescription: "Lower ZUS contributions for 2 years",
          normal: "Normal ZUS contribution"
        },
        taxType: {
          title: "Income tax:",
          progressive: "12% / 32%",
          linear: "19% (linear)"
        },
        voluntaryHealthInsurance: "Voluntary health insurance",
        businessCosts: "Business-related costs",
        bonus: "Bonus",
        salary: "Salary (gross)",
        calculate: "Calculate",
        varyingSalary: "My salary varies from month to month"
      },
      results: {
        summary: "Calculation Summary",
        grossSalary: "Gross Salary",
        netSalary: "Net Salary",
        contributions: {
          title: "Employee Contributions",
          pension: "Pension (9.76%)",
          disability: "Disability (1.5%)",
          sickness: "Sickness (2.45%)",
          health: "Health (9%)"
        },
        tax: {
          title: "Tax",
          advance: "Tax advance"
        }
      }
    },
    financing: {
      title: "Financing",
      subtitle: "Support NGO platform development",
      support: {
        title: "Support Us",
        description: "If you're satisfied with using our platform, we invite you to support us with any donation.",
        bankDetails: {
          title: "Bank transfer details:",
          name: "ITComplete Krzysztof Siek",
          account: "Account number: XX XXXX XXXX XXXX XXXX XXXX XXXX",
          transferTitle: "Title: NGO platform support"
        }
      },
      customPlatform: {
        title: "Custom Platform for Your Company",
        description: "Interested in having your own platform? Contact us and we'll prepare an individual pricing tailored to your company's needs.",
        contact: {
          phone: "Phone",
          email: "Email"
        }
      }
    },
    news: {
      categories: {
        country: "Country",
        technology: "Technology",
        science: "Science",
        energy: "Energy"
      },
      readMore: "Read more",
      loading: "Loading news...",
      error: "Error loading news",
      noNews: "No news available"
    },
    energyChart: {
      title: "Electricity price with next day delivery (RB)",
      subtitle: "in PLN per megawatt hour (PLN/MWh)",
      legend: {
        price: "Price (PLN/MWh)",
        volume: "Volume (MWh)",
        date: "Date"  // Dodane brakujące pole
      },
      loading: "Loading data...",
      error: "Error loading data",
      retry: "Retrying...",
      source: "Data: Polish Power Grid"
    },
    videoCommunication: {
      title: "Video Conferencing Platforms",
      joinNow: "Join Now",
      keyFeatures: "Key Features",
      platforms: {
        googleMeet: {
          name: "Google Meet",
          description: "Perfect for quick business and educational meetings",
          features: [
            "Up to 100 participants in free version",
            "Google Calendar integration",
            "No installation required - works in browser",
            "60-minute time limit in free version"
          ],
          bestFor: "Best for organizations using G Suite and quick business meetings"
        },
        zoom: {
          name: "Zoom",
          description: "Advanced tool for professional video conferences",
          features: [
            "Up to 100 participants in free version",
            "Advanced screen sharing options",
            "Virtual backgrounds and filters",
            "40-minute time limit in free version"
          ],
          bestFor: "Best for large conferences and webinars"
        },
        teams: {
          name: "Microsoft Teams",
          description: "Comprehensive team collaboration tool",
          features: [
            "Full Office 365 integration",
            "Extended chat and file sharing options",
            "Large meetings capability",
            "No time limit"
          ],
          bestFor: "Best for companies using Microsoft ecosystem"
        },
        webex: {
          name: "Cisco Webex",
          description: "Professional solution for security-focused businesses",
          features: [
            "High-quality audio and video",
            "Advanced security features",
            "Calendar and business systems integration",
            "Free version up to 50 participants"
          ],
          bestFor: "Best for companies requiring high security level"
        }
      }
    },
    todoList: {
      title: "To Do List",
      newTask: "New Task",
      editTask: "Edit Task",
      columns: {
        todo: "To Do", 
        inProgress: "In Progress",
        done: "Done"
      },
      form: {
        title: "Title",
        titlePlaceholder: "Task Title",
        description: "Description",
        descriptionPlaceholder: "Task Description",
        startDate: "Start Date",
        dueDate: "Due Date",
        cancel: "Cancel", 
        add: "Add",
        save: "Save"
      },
      dates: {
        start: "Start",
        due: "Due"
      }
    },
    posts: {
      title: "Announcements",
      newPost: "New announcement",
      form: {
        title: "Title",
        content: "Content",
        type: "Type",
        submit: "Submit",
        description: "Create new announcement" // dodane
      },
      types: {
        JOB: "Job",
        ANNOUNCEMENT: "Announcement",
        OTHER: "Other"
      },
      reactions: {
        LIKE: "Like",
        LOVE: "Love",
        HAHA: "Haha",
        WOW: "Wow",
        SAD: "Sad",
        ANGRY: "Angry"
      },
      comments: {
        add: "Add comment",
        placeholder: "Write a comment...",
        submit: "Send"
      },
      delete: {
        confirm: "Are you sure you want to delete this post?",
        success: "Post has been deleted",
        error: "Failed to delete post"
      },
    },  
    events: {
      title: "Events",
      noEvents: "No events",
      createEvent: "Create Event",
      createdBy: "Created by",
      cancel: "Cancel", // Dodane
      filters: {
        title: "Filters",
        onlyFree: "Only free events",
        goingTo: "Events I'm going to",
        interested: "Events I'm interested in",
        myEvents: "My events"
      },
      stats: {
        title: "Statistics",
        total: "Total events",
        thisMonth: "Events this month",
        attending: "Events I'm attending",
        created: "My created events",
      },
      priceInfo: {
          free: "Free"
      },
      participation: {
        going: "Going",
        interested: "Interested",
        spots: "spots",
        spotsFilled: "spots filled"
      },
      delete: {
        confirm: "Are you sure you want to delete this event?",
        success: "Event has been deleted",
        error: "Failed to delete event"
      },
      participants: {
        going: "Participants",
        interested: "Interested"
      }
    },
    guide: {
      title: "Platform Guide",
      description: "Let us guide you through the platform's main features",
      buttons: {
        next: "Next",
        prev: "Previous",
        close: "Close",
        start: "Start Guide"
      },  
      steps: {
        home: {
          title: "Home",
          description: "Main dashboard containing current information, salary calculator and charts."
        },
        announcements: {
          title: "Announcements",
          description: "Announcements section - you can browse and add new announcements for the community here."
        },
        events: {
          title: "Events",
          description: "Calendar and list of upcoming organization events."
        },
        messages: {
          title: "Messages",
          description: "Internal communication system allowing contact with other users."
        },
        todo: {
          title: "Todo List",
          description: "A tool that allows users to organize their tasks, making it easier to manage their work."
        },
        library: {
          title: "Library",
          description: "File repository enabling storage and sharing of documents."
        },
        resources: {
          title: "Resources",
          description: "Module containing document templates and user training."
        },
        sharedFiles: {
          title: "Shared Files",
          description: "Shared file management center. Here you can view files you've shared with others and those shared with you."
        },
        videoComm: {
          title: "Video Communication",
          description: "Tool helping to choose the platform for conducting video conferences and online meetings."
        },
        calculator: {
          title: "Salary Calculator",
          description: "Tool for calculating salaries for different forms of employment."
        },
        energy: {
          title: "Energy",
          description: "Information and charts regarding energy prices."
        },
        financing: {
          title: "Financing",
          description: "Financing section - here you can support platform development and learn more about creating your own instance."
        },
        languageSwitcher: {
          title: "Language Switch",
          description: "Click here to change the platform language. Polish and English versions are available."
        },
        guideButton: {
          title: "Guide",
          description: "This button allows you to restart the guide at any time."
        },
        news: {
          title: "News",
          description: "Here you'll find the latest information from various categories - country events, technology, science, and energy."
        },
        calendarEvents: {
          title: "Upcoming Events",
          description: "List of upcoming organization events with details and registration options."
        },
        announcementsSection: {
          title: "Announcement Board",
          description: "Latest announcements and communications for the organization community."
        },
        assistant: {
          title: "NGO Platform Assistant",
          description: "Need help? Our intelligent assistant is available 24/7 and will answer all your questions."
        }
      },
    },
    library: {
      title: "Library",
      root: "Main Files",
      share: {
        title: "Share with users",
        searchPlaceholder: "Search users...",
        noUsers: "No users found",
        button: "Share"
      },
      upload: {
        button: "Upload file",
        title: "Upload new file",
        uploading: "Uploading..."
      },
      folder: {
        create: "New folder",
        name: "Folder name"
      },
      file: {
        download: "Download",
        share: "Share",
        delete: "Delete"
      },
      view: {
        grid: "Grid view",
        list: "List view"
      },
    },
    
    // Dodajemy sekcje dla wiadomości
    messages: {
      title: "Messages",
      new: "New message",
      search: "Search messages...",
      noMessages: "No messages",
      noConversation: "Select a conversation to start chatting",
      send: "Send",
      placeholder: "Write a message...",
      online: "Online",
      offline: "Offline", 
      lastSeen: "Last seen:",
      loading: "Loading...",
      administrator: "Administrator",
      unknownUser: "Unknown User",
      noUsers: "No users found",
      searchToChat: "Search for a person to start chatting.",
      searchUsers: "Search users..."
    },
    
    // Dodajemy sekcje dla zasobów
    resources: {
      title: "Resources",
      file: {
        size: "Size",
        downloads: "Downloads",
        added: "Added",
        unknown: "UNKNOWN",
        info: "Information",
        delete: "Delete",
        download: "Download",
        deleteConfirm: "Are you sure you want to delete this file?"
      },
      categories: {
        documents: "Documents",
        training: "Training",
        other: "Other"
      },
      upload: {
        button: "Add file"
      }
    },
  } as const;