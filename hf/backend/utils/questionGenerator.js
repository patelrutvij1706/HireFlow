// Question generator utility
// This can be replaced with external API calls (QuizAPI, OpenAI, etc.)

const generateQuestions = async (jobTitle, jobCategory, numberOfQuestions = 10) => {
  // Mock question generator - Replace with actual API call
  // Example: QuizAPI, OpenAI, or custom question database
  
  const questions = [];
  const categories = ['Technical', 'Logical Reasoning', 'Quantitative Aptitude', 'Verbal'];
  
  for (let i = 0; i < numberOfQuestions; i++) {
    const category = categories[i % categories.length];
    const questionNumber = i + 1;
    
    let question, options, correctAnswer;
    
    if (category === 'Technical') {
      question = `What is the time complexity of binary search?`;
      options = ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'];
      correctAnswer = 1; // Index of correct answer
    } else if (category === 'Logical Reasoning') {
      question = `If all roses are flowers and some flowers are red, which statement must be true?`;
      options = ['All roses are red', 'Some roses are red', 'No roses are red', 'Cannot be determined'];
      correctAnswer = 3; // Cannot be determined
    } else if (category === 'Quantitative Aptitude') {
      question = `What is 25% of 200?`;
      options = ['25', '50', '75', '100'];
      correctAnswer = 1; // 50
    } else {
      question = `Choose the correct synonym for "abundant":`;
      options = ['Scarce', 'Plentiful', 'Rare', 'Limited'];
      correctAnswer = 1; // Plentiful
    }
    
    questions.push({
      question,
      options,
      correctAnswer,
      questionType: 'Multiple Choice',
      category,
      points: 1
    });
  }
  
  return questions;
};

// Function to call external API (QuizAPI example)
const generateQuestionsFromAPI = async (jobTitle, jobCategory, numberOfQuestions = 10) => {
  try {
    // Example: QuizAPI integration
    // const response = await fetch(`https://quizapi.io/api/v1/questions?apiKey=${process.env.QUIZ_API_KEY}&limit=${numberOfQuestions}&category=${jobCategory}`);
    // const data = await response.json();
    // return formatQuestionsFromAPI(data);
    
    // For now, use mock questions
    return await generateQuestions(jobTitle, jobCategory, numberOfQuestions);
  } catch (error) {
    console.error('Error generating questions from API:', error);
    // Fallback to mock questions
    return await generateQuestions(jobTitle, jobCategory, numberOfQuestions);
  }
};

module.exports = {
  generateQuestions,
  generateQuestionsFromAPI
};







