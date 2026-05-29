import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export async function POST(request: Request) {
  try {
    const configData = await request.json();
    
    // Path to data.json
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const dataFile = path.join(dataDir, 'data.json');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(dataFile, JSON.stringify(configData, null, 2), 'utf-8');
    
    const commitMessage = 'Admin update: Product & Landing Info ' + new Date().toISOString();
    
    return new Promise<Response>((resolve) => {
      exec(`git add public/data/data.json && git commit -m "${commitMessage}" && git push`, (error) => {
        if (error) {
          console.error(`Git Error: ${error.message}`);
          resolve(NextResponse.json({ 
            success: false, 
            message: 'File saved locally, but failed to push to GitHub.', 
            error: error.message 
          }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ 
          success: true, 
          message: 'Configuration saved and deployed to GitHub successfully!' 
        }));
      });
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to write config file.', 
      error: err.message 
    }, { status: 500 });
  }
}
