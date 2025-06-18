import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  addDoc 
} from 'firebase/firestore';

export interface UserData {
  email: string;
  nama: string;
  universitas: string;
  jurusan: string;
  targetScore: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
}

export interface Answer {
  id: string;
  correctAnswer: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: Date;
}

export interface SimulationProgress {
  simulationId: number;
  currentSubtest: 'tps' | 'indo' | 'eng' | 'mat';
  currentQuestion: number;
  timeLeft: number;
  startTime: Date;
  isStarted: boolean;
  isCompleted: boolean;
}

export interface SubtestResult {
  subtest: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
}

export interface SimulationResult {
  simulationId: number;
  subtestResults: SubtestResult[];
  finalScore: number;
  completedAt: Date;
}

// Check if user exists by email
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
}

// Get user data by email
export async function getUserByEmail(email: string): Promise<UserData | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return userDoc.data() as UserData;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

// Create new user
export async function createUser(userData: Omit<UserData, 'createdAt'>): Promise<void> {
  try {
    const usersRef = collection(db, 'users');
    const userDocRef = doc(usersRef);
    
    const newUserData: UserData = {
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date()
    };
    
    await setDoc(userDocRef, newUserData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Store email for registration process
export async function storeEmailForRegistration(email: string): Promise<void> {
  try {
    const tempEmailsRef = collection(db, 'temp_emails');
    const emailDocRef = doc(tempEmailsRef, email.toLowerCase());
    
    await setDoc(emailDocRef, {
      email: email.toLowerCase(),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error storing email for registration:', error);
    throw error;
  }
}

// Get question by category and question number
export async function getQuestion(category: string, questionNumber: number): Promise<Question | null> {
  try {
    let collectionName = '';
    
    switch (category) {
      case 'tes-potensi-skolastik':
        collectionName = 'qextps';
        break;
      case 'literasi-bahasa-indonesia':
        collectionName = 'qexindo';
        break;
      case 'literasi-bahasa-inggris':
        collectionName = 'qexeng';
        break;
      case 'penalaran-matematika':
        collectionName = 'qexmat';
        break;
      default:
        throw new Error('Invalid category');
    }
    
    console.log(`Fetching question from collection: ${collectionName}, document: ${questionNumber}`);
    
    const questionRef = doc(db, collectionName, questionNumber.toString());
    const questionSnap = await getDoc(questionRef);
    
    if (questionSnap.exists()) {
      const data = questionSnap.data();
      console.log('Raw question data retrieved:', data);
      
      // Validate the data structure
      if (!data.question) {
        console.error('Missing question field:', data);
        return null;
      }

      if (!data.options) {
        console.error('Missing options field:', data);
        return null;
      }
      
      // Handle different options formats
      let options;
      
      if (typeof data.options === 'string') {
        // If options is stored as a string, try to parse it
        console.log('Options stored as string, attempting to parse...');
        
        // Try to parse if it looks like JSON
        if (data.options.trim().startsWith('{')) {
          try {
            options = JSON.parse(data.options);
          } catch (e) {
            console.error('Failed to parse options JSON:', e);
            return null;
          }
        } else {
          // Handle the format "A: value B: value C: value D: value E: value" or "A. value B. value C. value D. value E. value"
          const optionMatches = data.options.match(/([A-E])[.:]\s*([^A-E]*?)(?=\s*[A-E][.:]|$)/g);
          if (optionMatches && optionMatches.length === 5) {
            options = {};
            optionMatches.forEach((match: string) => {
              const [, letter, value] = match.match(/([A-E])[.:]\s*(.*)/) || [];
              if (letter && value !== undefined) {
                options[letter] = value.trim();
              }
            });
          } else {
            console.error('Unable to parse options string format:', data.options);
            return null;
          }
        }
      } else if (typeof data.options === 'object' && data.options !== null) {
        options = data.options;
      } else {
        console.error('Invalid options type:', typeof data.options, data.options);
        return null;
      }
      
      // Validate that we have all required options
      if (!options || typeof options !== 'object' || 
          !options.hasOwnProperty('A') || typeof options.A !== 'string' ||
          !options.hasOwnProperty('B') || typeof options.B !== 'string' ||
          !options.hasOwnProperty('C') || typeof options.C !== 'string' ||
          !options.hasOwnProperty('D') || typeof options.D !== 'string' ||
          !options.hasOwnProperty('E') || typeof options.E !== 'string') {
        console.error('Invalid options structure after parsing:', options);
        console.error('Expected: object with A, B, C, D, E string properties');
        return null;
      }
      
      const validatedQuestion: Question = {
        id: questionSnap.id,
        question: data.question,
        options: {
          A: options.A,
          B: options.B,
          C: options.C,
          D: options.D,
          E: options.E
        }
      };
      
      console.log('Validated question data:', validatedQuestion);
      return validatedQuestion;
    } else {
      console.log(`No question found in ${collectionName} with ID ${questionNumber}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting question:', error);
    throw error;
  }
}

// Get answer by category and question number
export async function getAnswer(category: string, questionNumber: number): Promise<Answer | null> {
  try {
    let collectionName = '';
    
    switch (category) {
      case 'tes-potensi-skolastik':
        collectionName = 'aextps';
        break;
      case 'literasi-bahasa-indonesia':
        collectionName = 'aexindo';
        break;
      case 'literasi-bahasa-inggris':
        collectionName = 'aexeng';
        break;
      case 'penalaran-matematika':
        collectionName = 'aexmat';
        break;
      default:
        throw new Error('Invalid category');
    }
    
    console.log(`Fetching answer from collection: ${collectionName}, document: ${questionNumber}`);
    
    const answerRef = doc(db, collectionName, questionNumber.toString());
    const answerSnap = await getDoc(answerRef);
    
    if (answerSnap.exists()) {
      const data = answerSnap.data();
      console.log('Answer data retrieved:', data);
      
      // Validate answer data
      if (!data.correctAnswer || !['A', 'B', 'C', 'D', 'E'].includes(data.correctAnswer)) {
        console.error('Invalid answer data:', data);
        return null;
      }
      
      return {
        id: answerSnap.id,
        correctAnswer: data.correctAnswer
      } as Answer;
    } else {
      console.log(`No answer found in ${collectionName} with ID ${questionNumber}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting answer:', error);
    throw error;
  }
}

// Get simulation question with new collection structure
export async function getSimulationQuestion(
  simulationNumber: number, 
  subtest: 'tps' | 'indo' | 'eng' | 'mat', 
  questionNumber: number
): Promise<Question | null> {
  try {
    const collectionName = `qs${simulationNumber}${subtest}`;
    const questionRef = doc(db, collectionName, questionNumber.toString());
    const questionSnap = await getDoc(questionRef);
    
    if (questionSnap.exists()) {
      const data = questionSnap.data();
      
      // Validate the data structure
      if (!data.question || !data.options) {
        console.error('Invalid simulation question data structure:', data);
        return null;
      }
      
      // Handle options similar to exercise questions
      let options = data.options;
      if (typeof options === 'string') {
        // Parse string format if needed - handle both colon and period separators
        const optionMatches = options.match(/([A-E])[.:]\s*([^A-E]*?)(?=\s*[A-E][.:]|$)/g);
        if (optionMatches && optionMatches.length === 5) {
          const parsedOptions: any = {};
          optionMatches.forEach((match: string) => {
            const [, letter, value] = match.match(/([A-E])[.:]\s*(.*)/) || [];
            if (letter && value !== undefined) {
              parsedOptions[letter] = value.trim();
            }
          });
          options = parsedOptions;
        }
      }
      
      return {
        id: questionSnap.id,
        question: data.question,
        options: {
          A: options.A,
          B: options.B,
          C: options.C,
          D: options.D,
          E: options.E
        }
      } as Question;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting simulation question:', error);
    throw error;
  }
}

// Get simulation answer with new collection structure
export async function getSimulationAnswer(
  simulationNumber: number, 
  subtest: 'tps' | 'indo' | 'eng' | 'mat', 
  questionNumber: number
): Promise<Answer | null> {
  try {
    const collectionName = `as${simulationNumber}${subtest}`;
    const answerRef = doc(db, collectionName, questionNumber.toString());
    const answerSnap = await getDoc(answerRef);
    
    if (answerSnap.exists()) {
      const data = answerSnap.data();
      return {
        id: answerSnap.id,
        correctAnswer: data.correctAnswer
      } as Answer;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting simulation answer:', error);
    throw error;
  }
}

// Save user answer for exercise
export async function saveUserExerciseAnswer(
  userEmail: string, 
  category: string, 
  questionNumber: number, 
  selectedAnswer: string
): Promise<void> {
  try {
    let collectionName = '';
    
    switch (category) {
      case 'tes-potensi-skolastik':
        collectionName = 'uextps';
        break;
      case 'literasi-bahasa-indonesia':
        collectionName = 'uexindo';
        break;
      case 'literasi-bahasa-inggris':
        collectionName = 'uexeng';
        break;
      case 'penalaran-matematika':
        collectionName = 'uexmat';
        break;
      default:
        throw new Error('Invalid category');
    }
    
    // Get correct answer to check if user answer is correct
    const correctAnswer = await getAnswer(category, questionNumber);
    const isCorrect = correctAnswer ? selectedAnswer === correctAnswer.correctAnswer : false;
    
    console.log(`Saving user answer: ${selectedAnswer}, Correct: ${correctAnswer?.correctAnswer}, Is Correct: ${isCorrect}`);
    
    const userAnswerRef = doc(db, collectionName, `${userEmail}_${questionNumber}`);
    const userAnswerData: UserAnswer = {
      questionId: questionNumber.toString(),
      selectedAnswer,
      isCorrect,
      timestamp: new Date()
    };
    
    await setDoc(userAnswerRef, userAnswerData);
    console.log('User answer saved successfully');
  } catch (error) {
    console.error('Error saving user exercise answer:', error);
    throw error;
  }
}

// Save user answer for simulation with new collection structure
export async function saveUserSimulationAnswer(
  userEmail: string, 
  simulationNumber: number, 
  subtest: 'tps' | 'indo' | 'eng' | 'mat',
  questionNumber: number, 
  selectedAnswer: string
): Promise<void> {
  try {
    const collectionName = `us${simulationNumber}${subtest}`;
    
    // Get correct answer to check if user answer is correct
    const correctAnswer = await getSimulationAnswer(simulationNumber, subtest, questionNumber);
    const isCorrect = correctAnswer ? selectedAnswer === correctAnswer.correctAnswer : false;
    
    const userAnswerRef = doc(db, collectionName, `${userEmail}_${questionNumber}`);
    const userAnswerData: UserAnswer = {
      questionId: questionNumber.toString(),
      selectedAnswer,
      isCorrect,
      timestamp: new Date()
    };
    
    await setDoc(userAnswerRef, userAnswerData);
  } catch (error) {
    console.error('Error saving user simulation answer:', error);
    throw error;
  }
}

// Get user exercise answers for a category
export async function getUserExerciseAnswers(userEmail: string, category: string): Promise<UserAnswer[]> {
  try {
    let collectionName = '';
    
    switch (category) {
      case 'tes-potensi-skolastik':
        collectionName = 'uextps';
        break;
      case 'literasi-bahasa-indonesia':
        collectionName = 'uexindo';
        break;
      case 'literasi-bahasa-inggris':
        collectionName = 'uexeng';
        break;
      case 'penalaran-matematika':
        collectionName = 'uexmat';
        break;
      default:
        throw new Error('Invalid category');
    }
    
    const userAnswersRef = collection(db, collectionName);
    const q = query(userAnswersRef, where('__name__', '>=', `${userEmail}_`), where('__name__', '<', `${userEmail}_\uf8ff`));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as UserAnswer);
  } catch (error) {
    console.error('Error getting user exercise answers:', error);
    throw error;
  }
}

// Get user simulation answers for a specific subtest
export async function getUserSimulationAnswers(
  userEmail: string, 
  simulationNumber: number, 
  subtest: 'tps' | 'indo' | 'eng' | 'mat'
): Promise<UserAnswer[]> {
  try {
    const collectionName = `us${simulationNumber}${subtest}`;
    const userAnswersRef = collection(db, collectionName);
    const q = query(userAnswersRef, where('__name__', '>=', `${userEmail}_`), where('__name__', '<', `${userEmail}_\uf8ff`));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as UserAnswer);
  } catch (error) {
    console.error('Error getting user simulation answers:', error);
    throw error;
  }
}

// Save simulation progress
export async function saveSimulationProgress(
  userEmail: string, 
  progress: SimulationProgress
): Promise<void> {
  try {
    const progressRef = doc(db, 'simulation_progress', `${userEmail}_${progress.simulationId}`);
    await setDoc(progressRef, progress);
  } catch (error) {
    console.error('Error saving simulation progress:', error);
    throw error;
  }
}

// Get simulation progress
export async function getSimulationProgress(
  userEmail: string, 
  simulationId: number
): Promise<SimulationProgress | null> {
  try {
    const progressRef = doc(db, 'simulation_progress', `${userEmail}_${simulationId}`);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      return progressSnap.data() as SimulationProgress;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting simulation progress:', error);
    throw error;
  }
}

// Calculate and save simulation result
export async function calculateAndSaveSimulationResult(
  userEmail: string, 
  simulationNumber: number
): Promise<SimulationResult> {
  try {
    const subtests: Array<{ name: 'tps' | 'indo' | 'eng' | 'mat', totalQuestions: number }> = [
      { name: 'tps', totalQuestions: 90 },
      { name: 'indo', totalQuestions: 25 },
      { name: 'eng', totalQuestions: 20 },
      { name: 'mat', totalQuestions: 20 }
    ];
    
    const subtestResults: SubtestResult[] = [];
    
    for (const subtest of subtests) {
      const userAnswers = await getUserSimulationAnswers(userEmail, simulationNumber, subtest.name);
      const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
      const score = Math.round((correctAnswers / subtest.totalQuestions) * 50 * 10);
      
      subtestResults.push({
        subtest: subtest.name,
        correctAnswers,
        totalQuestions: subtest.totalQuestions,
        score
      });
    }
    
    const finalScore = Math.round(subtestResults.reduce((sum, result) => sum + result.score, 0) / subtestResults.length);
    
    const simulationResult: SimulationResult = {
      simulationId: simulationNumber,
      subtestResults,
      finalScore,
      completedAt: new Date()
    };
    
    // Save result to Firebase
    const resultRef = doc(db, 'simulation_results', `${userEmail}_${simulationNumber}`);
    await setDoc(resultRef, simulationResult);
    
    return simulationResult;
  } catch (error) {
    console.error('Error calculating simulation result:', error);
    throw error;
  }
}

// Get simulation result
export async function getSimulationResult(
  userEmail: string, 
  simulationNumber: number
): Promise<SimulationResult | null> {
  try {
    const resultRef = doc(db, 'simulation_results', `${userEmail}_${simulationNumber}`);
    const resultSnap = await getDoc(resultRef);
    
    if (resultSnap.exists()) {
      return resultSnap.data() as SimulationResult;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting simulation result:', error);
    throw error;
  }
}