;(function ($) {
  'use strict';

  function saveOptionsToChromeStorage(options, callback) {
    chrome.storage.sync.set(options, callback);
  }

  function loadItemsFromChromeStorage(options, callback) {
    chrome.storage.sync.get(options, function (items) {
      callback(items);
    });
  }

  function setFormValues(options) {
    for (var key in options) {
      var $formInput = $('#' + key);

      if ($formInput.prop('type') === 'checkbox') {
        $formInput.prop('checked', options[key]);
      } else {
        $formInput.prop('value', options[key]);
      }
    }
  }

  function getChangedValuesObject(changedAttributes) {
    var updates = {};

    for (var key in changedAttributes) {
      updates[key] = changedAttributes[key].newValue;
    }

    return updates;
  }

  $(document).ready(function () {
    loadItemsFromChromeStorage({
      url: '',
      saveCollapsedDiffs: true,
      tabSwitchingEnabled: false
      // Add new items here to get them loaded and their values put in the form.
    }, setFormValues);

    $('#options-form').submit(function (e) {
      e.preventDefault();

      var $form = $(e.currentTarget);
      var url = $form.find('#url').val();
      var origin = url.match(/https?:\/\/[^/?#]+/);
      var saveCollapsedDiffs = $form.find('#saveCollapsedDiffs').prop('checked');
      var tabSwitchingEnabled = $form.find('#tabSwitchingEnabled').prop('checked');

      if (origin) {
        origin[0] += '/*';
        chrome.permissions.request({
          origins: origin
        });
      }

      saveOptionsToChromeStorage({
        'url': url,
        'saveCollapsedDiffs': saveCollapsedDiffs,
        'tabSwitchingEnabled': tabSwitchingEnabled
      }, function () {
          var status = $('#status');
          status.text('Options saved.');
          setTimeout(function () {
              status.text('');
          }, 3000);
      });
    });

    $(document).on('click', '.btn-add', function(e) {
      e.preventDefault();
      var controlForm = $('.controls, #auto-collapse-form'),
          currentEntry = $(this).parents('.entry:first'),
          newEntry = $(currentEntry.clone()).appendTo(controlForm);

      newEntry.find('input').val('');
      controlForm.find('.entry:not(:last) .btn-add')
          .removeClass('btn-add').addClass('btn-remove')
          .removeClass('btn-success').addClass('btn-danger')
          .html('<span class="glyphicon glyphicon-minus"></span>');
    }).on('click', '.btn-remove', function(e){
      $(this).parents('.entry:first').remove();

      e.preventDefault();
      return false;
    });

    chrome.storage.onChanged.addListener(function (changes) {
      // The options were updated, update them here too.
      setFormValues(getChangedValuesObject(changes));
    });
  });
} (this.$));
