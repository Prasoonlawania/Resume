// ==========================================================================
// PrasoonOS AI Chat Agent Engine
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-send-btn');
  const chatHistory = document.getElementById('ai-chat-history');

  if (chatInput && sendBtn && chatHistory) {
    sendBtn.addEventListener('click', () => handleAiChatSubmit(chatInput, chatHistory));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleAiChatSubmit(chatInput, chatHistory);
      }
    });
  }
});

// ── SUBMIT CHAT MESSAGE ──
function handleAiChatSubmit(inputEl, historyEl) {
  const text = inputEl.value.trim();
  if (!text) return;

  // 1. Append User Message Bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg user';
  userMsg.innerHTML = `
    <div class="ai-avatar font-outfit">ME</div>
    <div class="msg-bubble font-inter">${escapeAiHtml(text)}</div>
  `;
  historyEl.appendChild(userMsg);
  
  // Clear input
  inputEl.value = '';
  
  // Scroll to bottom
  historyEl.scrollTop = historyEl.scrollHeight;

  // 2. Append Typing Indicator Bubble
  const typingMsg = document.createElement('div');
  typingMsg.className = 'ai-msg bot typing-indicator-msg';
  typingMsg.innerHTML = `
    <div class="ai-avatar font-outfit">AI</div>
    <div class="msg-bubble font-inter">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  historyEl.appendChild(typingMsg);
  historyEl.scrollTop = historyEl.scrollHeight;

  // 3. Process matched query after fake thinking delay
  setTimeout(() => {
    // Remove typing bubble
    typingMsg.remove();
    
    // Select matched answer
    const answer = getAiMatchedAnswer(text);
    
    // Create new Bot Message Bubble
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg bot';
    botMsg.innerHTML = `
      <div class="ai-avatar font-outfit">AI</div>
      <div class="msg-bubble font-inter"></div>
    `;
    historyEl.appendChild(botMsg);
    
    const bubbleContent = botMsg.querySelector('.msg-bubble');
    
    // Trigger typewriter streaming effect
    streamText(bubbleContent, answer, historyEl);
  }, 1000);
}

// ── TYPING / STREAMING TEXT EFFECT ──
function streamText(container, text, scrollTarget) {
  let index = 0;
  const speed = 12; // ms per character
  
  function type() {
    if (index < text.length) {
      if (text.substr(index, 4) === '<br>') {
        container.innerHTML += '<br>';
        index += 4;
      } else if (text.substr(index, 8) === '<strong>') {
        const end = text.indexOf('</strong>', index);
        if (end !== -1) {
          container.innerHTML += text.substring(index, end + 9);
          index = end + 9;
        } else {
          container.innerHTML += text.charAt(index);
          index++;
        }
      } else if (text.substr(index, 2) === '<a') {
        const end = text.indexOf('</a>', index);
        if (end !== -1) {
          container.innerHTML += text.substring(index, end + 4);
          index = end + 4;
        } else {
          container.innerHTML += text.charAt(index);
          index++;
        }
      } else {
        container.innerHTML += text.charAt(index);
        index++;
      }
      scrollTarget.scrollTop = scrollTarget.scrollHeight;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// ── STRUCTURAL RESUME KNOWLEDGE BASE ──
const RESUME_SECTIONS = [
  {
    id: "about",
    keywords: ["about", "bio", "summary", "profile", "background", "who", "prasoon", "lawania", "engineer", "developer", "founder", "undergraduate", "driven", "intro"],
    response: "Prasoon Lawania is a driven Computer Science & Engineering student bridging tech innovation with real-world human needs. He combines technical skills in AI/ML and Full-Stack Development with a founder's mindset. Currently, he is contributing to AI workflows as an Intern at <strong>Vicharanashala Lab (IIT Ropar)</strong>."
  },
  {
    id: "experience",
    keywords: ["experience", "intern", "internship", "vicharanashala", "iit", "ropar", "role", "work", "job", "history", "present"],
    response: "Prasoon is an <strong>AI, Machine Learning & Open-Source Development Intern</strong> at <strong>Vicharanashala Lab, IIT Ropar</strong> (May 2026 – Present). He architects ML models for community impact, optimizes deep learning workflows (using TensorFlow/PyTorch), and builds practical software bridges with LLMs."
  },
  {
    id: "raksha",
    keywords: ["raksha", "farmer", "agriculture", "agricultural", "query", "intelligence", "naive bayes", "pests", "recommendations", "similarity"],
    response: "<strong>AI-Driven Farmer Query Intelligence System (Raksha AI):</strong> Prasoon designed a smart agricultural engine analyzing farmer queries (weather, pests, market). It features full NLP text preprocessing, Multinomial Naive Bayes classification, and a cosine similarity retrieval engine to match historical localized recommendations."
  },
  {
    id: "csfaq",
    keywords: ["csfaq", "faq", "p2p", "student", "response", "rbac", "wikis", "vins", "connect"],
    response: "<strong>CSFAQ (Crowd-Sourced FAQ Platform) VINS Connect:</strong> Prasoon co-created this centralized peer-to-peer student response system for the Vicharanashala internship. It implements secure authentication and Role-Based Access Control (RBAC) matrices to scale answers into institutional wikis."
  },
  {
    id: "invenkart",
    keywords: ["invenkart", "founder", "ceo", "startup", "hub", "shops", "retailer", "business", "validation", "shops"],
    response: "<strong>InvenKart (Founder & CEO):</strong> Prasoon spearheaded InvenKart, a localized inventory hub connecting community buyers directly with neighborhood shops. He led the product roadmap, hyperlocal market validation, and business model canvas."
  },
  {
    id: "education",
    keywords: ["education", "college", "gec", "degree", "study", "semester", "academics", "bharatpur", "btech", "b.tech", "b tech"],
    response: "Prasoon is pursuing a <strong>Bachelor of Technology (B.Tech)</strong> in <strong>Computer Science & Engineering</strong> at <strong>Engineering College Bharatpur</strong> (2024 – 2028)."
  },
  {
    id: "cgpa",
    keywords: ["cgpa", "gpa", "pointer", "grades", "score", "marks", "percentage", "academic score"],
    response: "Prasoon maintains an excellent academic record with a current B.Tech CGPA of <strong>8.78 / 10.0</strong> at Engineering College Bharatpur."
  },
  {
    id: "school12",
    keywords: ["xii", "12th", "12", "percentage XII", "high school", "antariksha", "academy"],
    response: "Prasoon completed his Class XII (RBSE) in 2023 at <strong>Antariksha Academy Senior Secondary School</strong> with a score of <strong>78.6%</strong>."
  },
  {
    id: "school10",
    keywords: ["x", "10th", "10", "percentage X", "matriculation", "holy mother"],
    response: "Prasoon completed his Class X (RBSE) in 2021 at <strong>Holy Mother Public Secondary School</strong> with a score of <strong>93.0%</strong>."
  },
  {
    id: "skills_languages",
    keywords: ["languages", "programming", "fluent", "python", "c++", "java", "c", "sql"],
    response: "Prasoon is proficient in these programming languages: <strong>Python, C++, Java, C, and SQL</strong>."
  },
  {
    id: "skills_ai",
    keywords: ["ai", "ml", "dl", "nlp", "llms", "tensorflow", "pytorch", "power bi", "deep learning", "machine learning"],
    response: "Prasoon's AI/ML skills include: <strong>Machine Learning, Deep Learning, NLP, LLMs, TensorFlow, PyTorch, and Power BI</strong>."
  },
  {
    id: "skills_web",
    keywords: ["web", "stack", "react", "node", "express", "typescript", "mongodb", "firebase", "tailwind", "frontend", "backend"],
    response: "Prasoon's full-stack web development skills include: <strong>React.js, Node.js, Express.js, TypeScript, MongoDB, Firebase Firestore, and Tailwind CSS</strong>."
  },
  {
    id: "skills_core",
    keywords: ["core", "concepts", "fundamentals", "dsa", "oop", "dbms", "data structures", "algorithms"],
    response: "Prasoon is strong in core Computer Science fundamentals: <strong>Data Structures & Algorithms (DSA), Object-Oriented Programming (OOPs), and DBMS</strong>."
  },
  {
    id: "skills_all",
    keywords: ["skills", "technical skills", "stack", "technologies"],
    response: "Prasoon's technical stack spans across:<br>" +
              "• <strong>Languages:</strong> Python, C++, Java, C, SQL<br>" +
              "• <strong>AI/ML & Data:</strong> Machine Learning, Deep Learning, NLP, LLMs, TensorFlow, PyTorch, Power BI<br>" +
              "• <strong>Web Stack:</strong> React.js, Node.js, Express.js, TypeScript, MongoDB, Firebase Firestore, Tailwind CSS<br>" +
              "• <strong>Core Concepts:</strong> Data Structures & Algorithms (DSA), Object-Oriented Programming (OOPs), DBMS"
  },
  {
    id: "poetry",
    keywords: ["poetry", "shayari", "writing", "hindi", "creative writing", "themes", "poems"],
    response: "Prasoon is a passionate creative writer. He authors contemporary <strong>Hindi poetry and Shayari</strong> focused on themes of resilience, self-discovery, and community support."
  },
  {
    id: "photography",
    keywords: ["photography", "storytelling", "visual", "narratives", "environmental", "portrait"],
    response: "Prasoon engages in visual storytelling, producing original digital media and self-portrait photography narratives using structured environmental compositions."
  },
  {
    id: "trust",
    keywords: ["trust", "charitable", "shree murari", "dulari", "devi", "web operations", "digital trust"],
    response: "Prasoon handles Digital Trust Management, coordinating web operations and digital media presence for the <strong>Shree Murari Lal Dulari Devi Charitable Trust</strong>."
  },
  {
    id: "freshers",
    keywords: ["party", "freshers", "college event", "organizer", "logistics", "2025"],
    response: "Prasoon served as the <strong>Head Organizer for the College Freshers' Party 2025</strong>, managing layout dynamics and organizational logistics."
  },
  {
    id: "nss",
    keywords: ["nss", "volunteer", "welfare", "national service", "unnat", "bharat", "community"],
    response: "Prasoon is an active volunteer for the <strong>National Service Scheme (NSS)</strong> and the <em>Unnat Bharat Abhiyan</em>, contributing to community development."
  },
  {
    id: "certifications",
    keywords: ["certifications", "certificate", "nvidia", "google", "ai Tools"],
    response: "Prasoon's certifications include:<br>" +
              "• <strong>Google:</strong> Intro to AI & Maximize Productivity with AI Tools<br>" +
              "• <strong>NVIDIA:</strong> Fundamentals of Deep Learning"
  },
  {
    id: "simulations",
    keywords: ["simulation", "simulations", "jpmorgan", "deloitte", "tata", "cybersecurity", "analytics"],
    response: "Prasoon has completed professional job simulations from: <strong>JPMorgan Chase</strong> (Software Engineering), <strong>Deloitte Australia</strong> (Data Analytics), and <strong>Tata</strong> (Cybersecurity)."
  },
  {
    id: "contact_phone",
    keywords: ["phone", "call", "number", "mobile", "whatsapp", "+91", "86194"],
    response: "You can reach Prasoon by phone or WhatsApp at <strong>+91 86194 94374</strong>."
  },
  {
    id: "contact_email",
    keywords: ["email", "gmail", "mail", "write to", "lawaniaprasoon", "plawania05", "prasoonlawania"],
    response: "You can email Prasoon at: <strong>lawaniaprasoon@gmail.com</strong>, <strong>plawania05@gmail.com</strong>, or <strong>prasoonlawania@ecbharatpur.ac.in</strong>."
  },
  {
    id: "contact_all",
    keywords: ["contact", "social", "github", "linkedin", "location", "address", "reach", "gmail", "connect"],
    response: "Here is how you can connect with Prasoon:<br>" +
              "• <strong>Location:</strong> Bharatpur, Rajasthan, India<br>" +
              "• <strong>Phone:</strong> +91 86194 94374<br>" +
              "• <strong>Emails:</strong> lawaniaprasoon@gmail.com / plawania05@gmail.com / prasoonlawania@ecbharatpur.ac.in<br>" +
              "• <strong>LinkedIn:</strong> <a href='https://linkedin.com/in/prasoon-lawania' target='_blank'>linkedin.com/in/prasoon-lawania</a><br>" +
              "• <strong>GitHub:</strong> <a href='https://github.com/Prasoonlawania' target='_blank'>github.com/Prasoonlawania</a>"
  }
];

// ── NLP RULE-BASED MATCHING DICTIONARY ──
function getAiMatchedAnswer(query) {
  const q = query.toLowerCase().replace(/[^\w\s]/g, ' '); // remove punctuation
  const words = q.split(/\s+/).filter(w => w.length > 1); // get tokens
  
  if (words.length === 0) {
    return "Hello! I am Prasoon's personal AI Assistant. Ask me anything about his qualifications, experience at IIT Ropar, projects, or background!";
  }

  // Greetings check
  if (includesAny(q, ['hello', 'hi', 'hey', 'yo', 'greet', 'welcome', 'who are you', 'what is your name'])) {
    return "Hello! I am Prasoon's personal AI Assistant. Ask me anything about his qualifications, experience at IIT Ropar, projects, or background!";
  }

  let bestSection = null;
  let maxScore = 0;

  RESUME_SECTIONS.forEach(section => {
    let score = 0;
    words.forEach(word => {
      // Add match points if word exactly matches one of the keywords
      if (section.keywords.includes(word)) {
        score += 3;
      }
      // Check partial matching
      else {
        section.keywords.forEach(keyword => {
          if (keyword.length > 3 && (word.includes(keyword) || keyword.includes(word))) {
            score += 1.5;
          }
        });
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestSection = section;
    }
  });

  if (maxScore >= 1.5 && bestSection) {
    return bestSection.response;
  }

  return "I'm not fully sure about that specific query. However, I can help you find details about Prasoon's <strong>experience at IIT Ropar</strong>, <strong>education</strong>, <strong>skills</strong>, <strong>projects</strong>, or <strong>creative pursuits</strong>. Feel free to ask!";
}

// Helpers
function includesAny(str, keywords) {
  return keywords.some(k => str.includes(k));
}

function escapeAiHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
