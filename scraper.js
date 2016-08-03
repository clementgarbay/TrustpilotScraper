function startScraperForCategory(urlCategory) {

  var category = urlCategory.split('/')[2];

  var scraper = {
    iterator: '.category-results .rankings .ranking',
    data: {
      company: {
        sel: 'h2 a', 
        method: function($) {
          return $(this).text().split('. ').pop().trim();
        }
      },
      reviewsUrl: {
        sel: 'h2 a', 
        method: function($) {
          return 'https://fr.trustpilot.com' + $(this).attr('href').trim();
        }
      },
      opinions: {
        sel: '.stats .information',
        method: function($) {
          return $(this).text().split('|')[0].split('avis')[0].trim();
        }
      },
      trustScore: {
        sel: '.stats .information',
        method: function($) {
          return $(this).text().split('|')[1].split('Trustscore')[1].trim();
        }
      }
    }
  };

  artoo.log.debug(`Starting the scraper for category ${category}...`);
  var frontpage = artoo.scrape(scraper);

  artoo.ajaxSpider(
    function(i) {
      var url = `https://fr.trustpilot.com${urlCategory}?page=${i+1}`;
      artoo.log.debug(`Scraping url ${url}`);
      return url;
    },
    {
      limit: 2,
      throttle: 1000,
      scrape: scraper,
      concat: true,
      done: function(data) {
        data = frontpage.concat(data);
        artoo.log.debug(`Finished retrieving data for category ${category}. Downloading...`);
        artoo.saveCsv(
          data,
          {
            filename: `trustpilot-${category}.csv`,
            delimiter: ','
          }
        );
        artoo.log.info(`${data.length} companies found for category ${category}`);
      }
    }
  );
}

$('.category-menu-list .category-menu-list-item')
  .each((index, element) => {
    var urlCategory = $(element).find('a').attr('href');
    startScraperForCategory(urlCategory);
  });


