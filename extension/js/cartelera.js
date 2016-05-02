
$(document).ready(function () {
	console.log('En cartelera CineHoyts!!');

	$(document).on('DOMNodeInserted', '.listaCarteleraHorario', function(e) {
		if($(e.target).hasClass('tituloPelicula')) {
			pelicula = $(e.target);
			tiene_imdb = typeof pelicula.attr('data-rating') !== typeof undefined;
			if(!tiene_imdb) agrega_imdb(pelicula);
		}
	});

	function agrega_imdb(pelicula) {
		var titulo = pelicula.find('.descripcion header h3 a').text();
		pelicula.attr('data-titulo', titulo);
		pelicula.attr('data-rating', '0');
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
					  link_rating(id, pelicula);
			  	  } else {
	  			  	imdb_link = '<a href="http://www.imdb.com/title/' + id + '" target="_blank"><img src="' + imdb_img + '"></a>';
	  			  	pelicula.find('.descripcion header p').append(imdb_link);
			  	  }
	          }
	    });
	}
	
	function link_rating(imdb_id, pelicula) {
		var url = 'http://www.imdb.com/title/' + imdb_id + '/';
		$.ajax({ 
		    type: "GET",
		    dataType: "html",
		    url: url,
		    success: function(html){
				html = html.replace(/<img[^>]*>/g,"");
				html = $(html);
				rating = html.find('.imdbRating .ratingValue span[itemprop="ratingValue"]').text();
				pelicula.attr('data-rating', rating.replace(',', '.'));
				imdb_link = '<span class="imdbRatingPlugin imdbRatingStyle1" data-title="' + imdb_id + '" data-style="t1"><a href="http://www.imdb.com/title/' + imdb_id + '" target="_blank"><img src="' + imdb_img + '"></a><span class="rating">' + rating + '<span class="ofTen">/10</span></span><img src="' + imdb_star_img + '" class="star"></span>';
  			  	pelicula.find('.descripcion header p').append(imdb_link);
				
				// ordenar
				ordenar(pelicula.closest('.divComplejo'));
		    },
		    async: true,
		    error: function() {
		        return "Movie not found.";
		    }
		});
	}	

	function ordenar(complejo) {
		var peliculas = complejo.children('article');

		peliculas.sort(function(a,b){
			var ar = parseFloat(a.getAttribute('data-rating')),
				br = parseFloat(b.getAttribute('data-rating'));
			
			//console.log('Comparando ' + a.getAttribute('data-titulo') + ' (' + ar.toString() + ')' + ' - ' + b.getAttribute('data-titulo') + ' (' + br.toString() + ')');

			if(ar > br) {
				return -1 * orden_rating;
			}
			if(ar < br) {
				return 1 * orden_rating;
			}
			return 0;
		});

		peliculas.detach().insertAfter( complejo.find('.btnInfoComplejo') );		
	}
	
	// agrega filtro para ordenar por rating
	if(muestra_rating) {
		texto_link = orden_rating == 1? 'Rating ↓ (mayor a menor)' : 'Rating ↑ (menor a mayor)';
		filtro = $('<div id="ContentPlaceHolder1_filtro_rating" class="groupFiltro rating"><h3>Rating <img src="' + imdb_img + '"><i class="icon-caret-down float-right"></i></h3><div><a href="#" id="ordenar_rating">' + texto_link + '</a></div></div>');
		// al clickear ordenar
		filtro.find('#ordenar_rating').click(function() {
			// ordena por rating
			orden_rating *= -1; // orden opuesto
			texto_link = orden_rating == 1? 'Rating ↓ (mayor a menor)' : 'Rating ↑ (menor a mayor)';
			$(this).text(texto_link);
			
			$('.divComplejo').each(function() {
				complejo = $(this);
				ordenar(complejo);
			});			
			return false;
		});
		// click en titulo esconde filtro
	    filtro.find('h3').click(function (e) {
	        $(this).find("i").toggleClass('icon-caret-down icon-caret-up');
	        $(this).next("div").slideToggle(200);
	        e.preventDefault();
	        e.stopPropagation();
	    });
		
		// agrega filtro
		filtro.insertAfter($('#ContentPlaceHolder1_filtro_horarios'));
	}
		
});

