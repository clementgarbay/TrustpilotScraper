function startScraperForCategory(urlCategory) {

  const category = urlCategory.split('/')[2];

  const scraper = {
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
          return $(this).text().split('|')[0].split('avis')[0].replace(/\s/g, '').trim();
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
  const frontpage = artoo.scrape(scraper);

  function hasNext(nextIndex, $page) {
    const element = $page.find(`.pagination-container .pagination-page[data-page-number="${nextIndex}"]`);
    return element.attr('href') !== undefined;
  }

  artoo.ajaxSpider(
    function(i, $data) {
      const nextIndex = i + 1;
      if (hasNext(nextIndex, !i ? artoo.$(document) : $data)) {
        const url = `https://fr.trustpilot.com${urlCategory}?page=${nextIndex}`;
        artoo.log.debug(`Scraping url ${url}`);
        return url;
      }
      return false;
    },
    {
      // limit: 2,
      throttle: 1000,
      scrape: scraper,
      concat: true,
      done: function(data) {
        data = data.sort((a, b) => -(parseInt(a.opinions) - parseInt(b.opinions)));
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

(function() {
  artoo.$('.category-menu-list .category-menu-list-item')
    .each((index, element) => {
      const urlCategory = $(element).find('a').attr('href');
      startScraperForCategory(urlCategory);
    });
})()



