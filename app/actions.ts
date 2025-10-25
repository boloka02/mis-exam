
'use server';

import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const sql = neon(process.env.DATABASE_URL!);

// Initialize AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Validate Exam ID
export async function validateExamId(examId: string) {
  try {
    const result: any = await sql`SELECT * FROM examini_details WHERE examination_id = ${examId}`;
    console.log('validateExamId: Result for examId', examId, result[0] ? 'Found' : 'Not found');
    return result[0] || null;
  } catch (error) {
    console.error('validateExamId: Database error for examId', examId, error);
    return null;
  }
}

// Submit Phase One Exam & Calculate Score
export async function submitPhaseOneExam(examId: string, userAnswers: any) {
  try {
    const correctAnswers = {
      acquisitionAccount: '11456789',
      acquisitionSecurity: 'Nv8',
      landecStatus: 'Inactive',
      heliosName: 'Helios Incorporated',
      heliosSecurity: 'tRR'
    };

    let score = 0;
    const totalQuestions = 5;
    const questionKeys = Object.keys(correctAnswers);

    questionKeys.forEach((key) => {
      if (userAnswers[key] === correctAnswers[key as keyof typeof correctAnswers]) {
        score++;
      }
    });

    const percentage = ((score / totalQuestions) * 100).toFixed(2);
    const isPassed = score >= 3;

    const result = await sql`
      INSERT INTO phaseone_results (examination_id, user_answers, score, total_questions, percentage, is_passed)
      VALUES (${examId}, ${JSON.stringify(userAnswers)}, ${score}, ${totalQuestions}, ${percentage}, ${isPassed})
      RETURNING *;
    `;

    return {
      success: true,
      score,
      totalQuestions,
      percentage: parseFloat(percentage),
      isPassed,
      correctAnswers,
      userAnswers
    };
  } catch (error) {
    console.error('submitPhaseOneExam: Error for examId', examId, error);
    return {
      success: false,
      error: 'Failed to submit exam'
    };
  }
}

// Submit Phase Two Exam & Calculate Score
export async function submitPhaseTwoExam(examId: string, userAnswers: any) {
  try {
    const exam = await validateExamId(examId);
    if (!exam) {
      console.log('submitPhaseTwoExam: Invalid examId', examId);
      return {
        success: false,
        error: 'Invalid examination ID'
      };
    }

    const correctAnswers = {
      q1: 'on',
      q2: 'gone',
      q3: 'been',
      q4: 'been',
      q5: 'gone',
      q6: 'in',
      q7: 'of',
      q8: 'to',
      q9: 'weren’t',
      q10: 'were'
    };

    let score = 0;
    const totalQuestions = 10;
    const questionKeys = Object.keys(correctAnswers);

    questionKeys.forEach((key) => {
      if (userAnswers[key] === correctAnswers[key as keyof typeof correctAnswers]) {
        score++;
      }
    });

    const percentage = ((score / totalQuestions) * 100).toFixed(2);
    const isPassed = score >= 6;

    const result = await sql`
      INSERT INTO phasetwo_results (examination_id, user_answers, score, total_questions, percentage, is_passed)
      VALUES (${examId}, ${JSON.stringify(userAnswers)}, ${score}, ${totalQuestions}, ${percentage}, ${isPassed})
      RETURNING *;
    `;

    return {
      success: true,
      id: result[0].id
    };
  } catch (error) {
    console.error('submitPhaseTwoExam: Error for examId', examId, error);
    return {
      success: false,
      error: 'Failed to submit exam'
    };
  }
}

// Submit Phase Three Exam (Typing Test)
export async function submitPhaseThreeExam(examId: string, file: File) {
  try {
    console.log('submitPhaseThreeExam: Starting for examId', examId);

    // Validate exam ID
    try {
      const exam = await validateExamId(examId);
      if (!exam) {
        console.log('submitPhaseThreeExam: Invalid examId', examId);
        return {
          success: false,
          error: 'Invalid examination ID'
        };
      }
    } catch (error) {
      console.error('submitPhaseThreeExam: validateExamId error', examId, error);
      return {
        success: false,
        error: 'Failed to validate exam ID: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }

    // Validate file
    if (!file) {
      console.log('submitPhaseThreeExam: No file provided');
      return {
        success: false,
        error: 'No file uploaded'
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log('submitPhaseThreeExam: File size exceeds 10 MB', file.size);
      return {
        success: false,
        error: 'File size exceeds 10 MB'
      };
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      console.log('submitPhaseThreeExam: Invalid file type', file.type);
      return {
        success: false,
        error: 'Invalid file type. Only PNG, JPEG, or JPG allowed'
      };
    }

    // Upload file to S3
    const fileName = `${examId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `uploads/phase3/${fileName}`,
      Body: fileBuffer,
      ContentType: file.type,
    };

    try {
      console.log('submitPhaseThreeExam: Uploading to S3', { bucket: process.env.AWS_S3_BUCKET_NAME, key: s3Params.Key });
      await s3Client.send(new PutObjectCommand(s3Params));
    } catch (error) {
      console.error('submitPhaseThreeExam: S3 upload error', examId, error);
      return {
        success: false,
        error: 'Failed to upload to S3: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/phase3/${fileName}`;

    // Save to database
    try {
      console.log('submitPhaseThreeExam: Inserting into database', { examId, fileName, fileUrl });
      const result = await sql`
        INSERT INTO phasethree_results (examination_id, file_name, file_path)
        VALUES (${examId}, ${fileName}, ${fileUrl})
        RETURNING *;
      `;
      console.log('submitPhaseThreeExam: Database insert successful, ID:', result[0].id);

      return {
        success: true,
        id: result[0].id
      };
    } catch (error) {
      console.error('submitPhaseThreeExam: Database insert error', examId, error);
      return {
        success: false,
        error: 'Failed to save to database: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  } catch (error) {
    console.error('submitPhaseThreeExam: Unexpected error for examId', examId, error);
    return {
      success: false,
      error: 'Unexpected error: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

// Submit Phase Four Exam (Google Sheets Test)
export async function submitPhaseFourExam(examId: string, file: File) {
  try {
    console.log('submitPhaseFourExam: Starting for examId', examId);

    // Validate exam ID
    try {
      const exam = await validateExamId(examId);
      if (!exam) {
        console.log('submitPhaseFourExam: Invalid examId', examId);
        return {
          success: false,
          error: 'Invalid examination ID'
        };
      }
    } catch (error) {
      console.error('submitPhaseFourExam: validateExamId error', examId, error);
      return {
        success: false,
        error: 'Failed to validate exam ID: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }

    // Validate file
    if (!file) {
      console.log('submitPhaseFourExam: No file provided');
      return {
        success: false,
        error: 'No file uploaded'
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log('submitPhaseFourExam: File size exceeds 10 MB', file.size);
      return {
        success: false,
        error: 'File size exceeds 10 MB'
      };
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    if (!allowedTypes.includes(file.type)) {
      console.log('submitPhaseFourExam: Invalid file type', file.type);
      return {
        success: false,
        error: 'Invalid file type. Only XLSX or XLS allowed'
      };
    }

    // Upload file to S3
    const fileName = `${examId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `uploads/phase4/${fileName}`,
      Body: fileBuffer,
      ContentType: file.type,
    };

    try {
      console.log('submitPhaseFourExam: Uploading to S3', { bucket: process.env.AWS_S3_BUCKET_NAME, key: s3Params.Key });
      await s3Client.send(new PutObjectCommand(s3Params));
    } catch (error) {
      console.error('submitPhaseFourExam: S3 upload error', examId, error);
      return {
        success: false,
        error: 'Failed to upload to S3: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/phase4/${fileName}`;

    // Save to database
    try {
      console.log('submitPhaseFourExam: Inserting into database', { examId, fileName, fileUrl });
      const result = await sql`
        INSERT INTO phasefour_results (examination_id, file_name, file_url)
        VALUES (${examId}, ${fileName}, ${fileUrl})
        RETURNING *;
      `;
      console.log('submitPhaseFourExam: Database insert successful, ID:', result[0].id);

      return {
        success: true,
        id: result[0].id
      };
    } catch (error) {
      console.error('submitPhaseFourExam: Database insert error', examId, error);
      return {
        success: false,
        error: 'Failed to save to database: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  } catch (error) {
    console.error('submitPhaseFourExam: Unexpected error for examId', examId, error);
    return {
      success: false,
      error: 'Unexpected error: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}
