import * as path from 'path';

import * as fs from 'fs-extra';


const sourceDir = path.join(__dirname, '..', 'src', 'emails');
const destDir = path.join(__dirname, '..', 'build', 'src', 'emails');

fs.copy(sourceDir, destDir)
  .then(() => console.log('Emails copied successfully!'))
  .catch(err => console.error('Error copying emails:', err));
