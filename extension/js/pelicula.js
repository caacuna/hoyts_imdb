
$(document).ready(function () {
	console.log('En película CineHoyts!!');
	var muestra_rating = true;
	var imdb_img = chrome.extension.getURL('img/imdb.png');
	var imdb_star_img = chrome.extension.getURL('img/imdb_star.png');

	agrega_imdb();
	
	function agrega_imdb() {
		var titulo = $('#ContentPlaceHolder1_ctl_sinopsis_ctl_titulo').text();
		var url = 'http://www.imdb.com/find?q=' + titulo + '&s=tt&ttype=ft';
		$.ajax({
	        url: url,
	        type: "GET",
	        dataType: "html",
	          success: function(html) {
				  html = html.replace(/<img[^>]*>/g,"");
				  html = $(html);
				  
				  // sin resultados
				  if(html.find('.findNoResults').length > 0) {
					  return;
				  }
				  
				  split = html.find('.findList .findResult:first .result_text a').attr('href').split('/');
				  id = split[2];
				  
				  if(muestra_rating) {
					  link_rating(id);
			  	  } else {
	  			  	imdb_link = '<a href="http://www.imdb.com/title/' + id + '" target="_blank"><img src="' + imdb_img + '"></a>';
	  			  	$('.infoAdicional').append(imdb_link);
			  	  }
	          }
	    });
	}
	
	function link_rating(imdb_id) {
		var url = 'http://www.imdb.com/title/' + imdb_id + '/';
		$.ajax({ 
		    type: "GET",
		    dataType: "html",
		    url: url,
		    success: function(html){
				html = html.replace(/<img[^>]*>/g,"");
				html = $(html);
				rating = html.find('.imdbRating .ratingValue span[itemprop="ratingValue"]').text();
				imdb_link = '<span class="imdbRatingPlugin imdbRatingStyle1" data-title="' + imdb_id + '" data-style="t1"><a href="http://www.imdb.com/title/' + imdb_id + '" target="_blank"><img src="' + imdb_img + '"></a><span class="rating">' + rating + '<span class="ofTen">/10</span></span><img src="' + imdb_star_img + '" class="star"></span>';
  			  	$('.infoAdicional').append(imdb_link);
		    },
		    async: true,
		    error: function() {
		        return "Movie not found.";
		    }
		});
	}	


		
});

