//     Stratus.Filters.Moment.js 1.0

//     Copyright (c) 2017 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Function Factory
// ----------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'lodash', 'angular'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Angular Age Filter
  // ---------------------

  // This filter allows a display of age since the given date
  Stratus.Filters.Age = function () {
    return function (birthday) {
      birthday = new Date(new Date(birthday).getTime() * 1000)
      const today = new Date()
      let age = (today - birthday) / 31557600000
      age = Math.floor(age)
      return age
    }
  }
}))
