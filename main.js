/* global alert,jQuery,Sortable */
'use strict';
var fc = '';
var tc = '';
var $date = $('#db');

function getCoordinates(address) {
  return jQuery.getJSON('https://maps.googleapis.com/maps/api/geocode/json', {
    address: address
  });

}


function formatDate(date) {
  if (date) {
    return [date.getDate(), (date.getMonth() + 1), +date.getFullYear()].join('/');
  } else {
    return '';
  }
}

function goSearch() {


  var db = encodeURIComponent(formatDate($date.get(0).valueAsDate));

  if (db === '' || fc === '') {
    //  alert('Please enter date and starting point');
    // return;
  }
  var bburl = 'https://www.blablacar.es/search_xhr?tc=' + tc + '&fc=' + fc + '&db=' + db + '&limit=200';
  $('#status').text('Fetching: ' + bburl);
  jQuery.getJSON('https://query.yahooapis.com/v1/public/yql', {
      q: 'select * from json where url="' + bburl + '"',

      format: 'json'
    },
    function(data) {
      $('#status').text('');
      //var o = ['username', 'age', 'level', 'time', 'to', 'from', 'ratings', 'car', 'price', 'availability'].join('\t') + '\n';
      var o = '<table id="table" class="sortable-theme-dark" data-sortable>';
      o += '<thead><tr>';
      o += '<th>' + ['username', 'age', 'level', 'time', 'from', 'to', 'stop', 'ratings', 'car', 'price', 'availability'].join('</th><th>') + '</th>';
      o += '</tr></thead>';

      o += '<tbody>';

      if (data.query.results.json) {

        var $a = jQuery(data.query.results.json.html.results).find('.trip');

        console.log(data.query.results.json.html.results);

        $a.each(function(index, a) {
          var $aa = jQuery(this);
          var url = 'http://www.blablacar.es' + $aa.find('a').attr('href');

          var username = $.trim($aa.find('.username').text());
          var time = $.trim($aa.find('.time').text().replace('-', '~').split('~')[1]);
          var age = $.trim($($aa.find('.user-info').contents()[2]).text().replace('años', ''));
          var level = $.trim($($aa.find('.user-info').contents()[4]).text());
          var from = $.trim($aa.find('.geo-from').text().split(',').join(' / '));
          var to = $.trim($aa.find('.geo-to').text().split(',').join(' / '));
          var stop = $.trim($aa.find('.trip-roads-stop').last().text());
          var ratings = $.trim($aa.find('.ratings-container').text().split('-')[0]);
          var car = $.trim($aa.find('.car-type strong').text());

          var availability = $.trim($aa.find('.availability strong').text()).replace('Completo', '0');

          var price = $.trim($aa.find('.price strong span').text().replace('€', ''));

          //o += [username, age, level, time, to, from, ratings, car, price, availability].join('\t') + '\n';
          o += '<tr style="cursor: pointer;" onclick="window.open(\'' + url + '\')"><td>' + [username, age, level, time, from, to, stop, ratings, car, price, availability].join('</td><td>') + '</td></tr>';
        });


      } else {
        alert('Error!');
      }
      o += '</tbody></table>';
      $('#table-container').html(o);
      $('#results').slideDown();
      Sortable.initTable(document.getElementById('table'));
    }
  );
}

function go() {
  fc = '';
  tc = '';
  var fcc = $('#fc').val();
  var tcc = $('#tc').val();
  getCoordinates(fcc).then(function(data) {
      if (data.results.length > 0) {
        var loc = data.results[0].geometry.location;
        fc = encodeURIComponent([loc.lat, loc.lng].join('|'));
        console.log('fc', fc);
      }
    })
    .then(getCoordinates.bind(window, tcc))
    .then(function(data) {
      if (data.results.length > 0) {
        var loc = data.results[0].geometry.location;
        tc = encodeURIComponent([loc.lat, loc.lng].join('|'));
        console.log('tc', tc);
      }
    })
    .then(goSearch);


}

$date.get(0).valueAsDate = new Date();
$('#go').click(go);
