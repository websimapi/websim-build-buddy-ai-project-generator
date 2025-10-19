import AIProjectGenerator from './ai-generator.js';

let imageFile = null;
let conversationHistory = [];
const generator = new AIProjectGenerator();

// UI Elements
const uploadBtn = document.getElementById('uploadBtn');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const contextInput = document.getElementById('contextInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const ideasContainer = document.getElementById('ideasContainer');
const guideContainer = document.getElementById('guideContainer');
const guideContent = document.getElementById('guideContent');
const backBtn = document.getElementById('backBtn');
const conversationSection = document.getElementById('conversationSection');
const conversationHistory_el = document.getElementById('conversationHistory');

// Upload image
uploadBtn.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', async (e) => {
    imageFile = e.target.files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.innerHTML = `<img src="${event.target.result}" alt="Uploaded item">`;
        };
        reader.readAsDataURL(imageFile);
    }
});

// Analyze and get project ideas
analyzeBtn.addEventListener('click', async () => {
    if (!imageFile && !contextInput.value.trim()) {
        alert('Please upload an image or add context about your items');
        return;
    }

    loadingState.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    try {
        let imageData = null;
        if (imageFile) {
            const reader = new FileReader();
            imageData = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(imageFile);
            });
        }

        const ideas = await generator.generateProjectIdeas(
            imageData,
            contextInput.value.trim(),
            conversationHistory
        );

        displayIdeas(ideas);
        updateConversationHistory(ideas);

        loadingState.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        loadingState.classList.add('hidden');
        alert('Error analyzing items. Please try again.');
    }
});

// Display project ideas
function displayIdeas(ideas) {
    ideasContainer.innerHTML = '';
    guideContainer.classList.add('hidden');

    ideas.forEach((idea, index) => {
        const card = document.createElement('div');
        card.className = 'idea-card';
        card.innerHTML = `
            <div class="idea-title">${idea.title}</div>
            <div class="idea-description">${idea.description}</div>
            <div class="idea-items">
                <strong>Uses:</strong> ${idea.itemsUsed}
            </div>
            <div class="idea-items">
                <strong>Difficulty:</strong> ${idea.difficulty}
            </div>
            <button class="idea-action" data-index="${index}">Get Step-by-Step Guide →</button>
        `;

        card.querySelector('.idea-action').addEventListener('click', async () => {
            await generateGuide(idea, index);
        });

        ideasContainer.appendChild(card);
    });
}

// Generate detailed guide for selected project
async function generateGuide(idea, index) {
    loadingState.classList.remove('hidden');
    ideasContainer.parentElement.style.display = 'none';

    try {
        const guide = await generator.generateDetailedGuide(
            idea,
            contextInput.value.trim(),
            conversationHistory
        );

        displayGuide(guide);
        updateConversationHistory(guide);

        loadingState.classList.add('hidden');
        guideContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        loadingState.classList.add('hidden');
        alert('Error generating guide. Please try again.');
    }
}

// Display detailed guide
function displayGuide(guide) {
    guideContent.innerHTML = `
        <h2>${guide.projectTitle}</h2>
        
        <div class="guide-section">
            <h3>📋 Overview</h3>
            <p>${guide.overview}</p>
        </div>

        <div class="guide-section">
            <h3>🛠️ Materials Needed</h3>
            <ul>${guide.materialsNeeded.map(m => `<li>${m}</li>`).join('')}</ul>
        </div>

        <div class="guide-section">
            <h3>⏱️ Time Required</h3>
            <p>${guide.timeRequired}</p>
        </div>

        <div class="guide-section">
            <h3>📝 Step-by-Step Instructions</h3>
            ${guide.steps.map((step, i) => `
                <div class="step">
                    <div class="step-number">Step ${i + 1}: ${step.title}</div>
                    <p>${step.description}</p>
                </div>
            `).join('')}
        </div>

        ${guide.blueprint ? `
            <div class="guide-section">
                <h3>📐 Blueprint</h3>
                <div class="blueprint">
                    ${guide.blueprintImage ? `<img src="${guide.blueprintImage}" alt="Blueprint">` : `<div class="blueprint-placeholder">Blueprint will be generated here</div>`}
                </div>
            </div>
        ` : ''}

        <div class="guide-section">
            <h3>💡 Tips & Tricks</h3>
            <ul>${guide.tips.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
    `;
}

// Back to ideas
backBtn.addEventListener('click', () => {
    guideContainer.classList.add('hidden');
    ideasContainer.parentElement.style.display = 'block';
});

// Update conversation history for context
function updateConversationHistory(data) {
    const message = {
        role: "assistant",
        content: JSON.stringify(data)
    };
    conversationHistory.push(message);
    conversationHistory = conversationHistory.slice(-6); // Keep last 6 messages
    
    if (conversationHistory.length > 0) {
        conversationSection.classList.remove('hidden');
        updateConversationDisplay();
    }
}

function updateConversationDisplay() {
    conversationHistory_el.innerHTML = conversationHistory.map(msg => `
        <div class="message ${msg.role}">
            ${msg.role === 'user' ? '👤' : '🤖'} 
            ${typeof msg.content === 'string' && msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content}
        </div>
    `).join('');
}

