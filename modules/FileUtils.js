define(function (require) {
  'use strict';

  // Get dependencies.
  var DocumentManager = brackets.getModule('document/DocumentManager');
  var LanguageManager = brackets.getModule('language/LanguageManager');

  // Extension modules.
  var Paths = require('modules/Paths');
  var Settings = require('modules/Settings');

  /**
   * Return function with logic to getAllFiles() to exclude folders and files.
   */
  function filter () {
    return function (file) {
      var relativePath = '^' + Paths.makeRelative(file.parentPath);
      var languageID = LanguageManager.getLanguageForPath(file.fullPath).getId();
      var fileName = file.name;
      var searchString;
      var i;
      var length;

      // Don't parse files not recognized by Brackets.
      if (['unknown', 'binary', 'image'].indexOf(languageID) > -1) {
        return false;
      }

      // Get files for parsing.
      if (Settings.get().search.scope === 'project') {
        // Go through all exclude filters for folders and compare to current file path.
        for (i = 0, length = Settings.get().search.excludeFolders.length; i < length; i++) {
          searchString = Settings.get().search.excludeFolders[i];

          // If root level is indicated (by first character being a slash) replace it with ^
          // to prevent matching subdirectories.
          if (searchString.charAt(0) === '/') {
            searchString = searchString.replace(/^\//, '^');
          }

          // Check for matches in path.
          if (relativePath.indexOf(searchString + '/') > -1) {
            return false;
          }
        }

        // Go through all exclude filters for files and compare to current file name.
        for (i = 0, length = Settings.get().search.excludeFiles.length; i < length; i++) {
          searchString = Settings.get().search.excludeFiles[i];

          // Check for matches in filename.
          if (fileName.indexOf(searchString) > -1) {
            return false;
          }
        }

        return true;
      } else if (DocumentManager.getCurrentDocument()) {
        // Get current file if one is open.
        return file === DocumentManager.getCurrentDocument().file;
      }

      return false;
    };
  }

  function map (file) {
    return {
      key: file.fullPath,
      name: Paths.makeRelative(file.fullPath),
      path: file.fullPath,
      expanded: false,
      file: file
    };
  }

  // Make variables accessible.
  return {
    filter: filter,
    map: map
  };
});