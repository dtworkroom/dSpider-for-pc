var grunt = require('grunt');

grunt.config.init({
  pkg: grunt.file.readJSON('package.json'),
  'create-windows-installer': {
    x64: {
      appDirectory: './dist/dSpider-win32-x64',
      exe: 'dSpider.exe',
      description: 'dSpider',
      setupIcon: 'ic_launcher.ico',
      skipUpdateIcon: true,
      noMsi: true
    }
  }
});

grunt.loadNpmTasks('grunt-electron-installer');
grunt.registerTask('win', ['create-windows-installer']);
