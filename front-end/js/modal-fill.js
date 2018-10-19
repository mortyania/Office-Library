$(document).ready(function(){
    let username = 'SW50ZWxsaWdlbnRMaWJyYXJ5';
    let password = 'V2VsY29tZTEyMw==';
    $('body').on('click', '#more-info', function(){
        let isbn = $(this).closest('tr').find('.isbn').text();

        $.getJSON(
            "http://127.0.0.1:8080/modal", 
            { isbn, username, password },
            function(data){
                let split = data['isbn'].split(' - ');
                console.log(data['isbn'])
                $('.modal-title').html(
                    split[1]
                );
                $('.modal-body').html(
                    `<p><b>ISBN:</b>    <span id='m-isbn'>${split[0]}</span></p>` +
                    `<p><b>Author(s):</b>   ${split[2].substring(0, split[2].length - 2)}</p>` +
                    `<p><b>Year Published:</b>   ${split[3]}</p>` +
                    `<p><b>Publisher:</b>   ${split[5]}</p>` +
                    `<p><b>Publisher address:</b>  ${split[6]}, ${split[7]}</p>` +
                    `<p><b>Currently On Loan?:</b>  ${(split[4]==='\u0000')?'No':'Yes'}</p>`
                );
                $('#loaning').show();
                $('#book-out').hide();
            }
        );       
    });

    $('#loaning').click(function(){
        let isbn = $('#m-isbn').text();
        console.log(isbn);
        $.getJSON(
            "http://127.0.0.1:8080/loan", 
            { isbn, username, password },
            function(data){
                console.log(data);
                let split = data['isbn'].split(' - ');
                
                if(data['isbn'] === "No results found"){
                    $('.modal-body').html(
                        `<p><b>ISBN:</b>    <span id='m-isbn'>${isbn}</span></p>` +
                        `<p>Currently availible.</p>` +
                        `<p>Would you like to book this out?</p>`                    
                    );
                    $('#book-out').show();                    
                }else{                    
                    console.log(data);
                    let date = split[4].split(' 01:00:00 ');
                    $('.modal-body').html(
                        `<p><b>ISBN:</b>    <span id='m-isbn'>${split[0]}</span></p>` +
                        `<p><b>On Loan To:</b>  ${split[2]} - ${split[3]}</p>` +
                        `<p><b>Due Return:</b>   ${date[0]}</p>`                    
                    );
                }
                $('#loaning').hide();

            }
        );    
    });

    $('#book-out').click(function(){        
        $('#book-out').hide();
        $('.modal-body').append(
            `<p><b>Please Enter your Library number</b></p>` +         
                `<input id="library-no" class="form-control mt-4" placeholder="Library No." style="margin-bottom: 15px; background-repeat: no-repeat; background-attachment: scroll; background-size: 16px 18px; background-position: 98% 50%; cursor: auto;" type="text">` +

                `<button class="btn btn-sm btn-block mt-4 text-white" id="reserve-btn" type="button">Reserve</button>`        
        );   
    });

    $(document).on('click', '#reserve-btn', function(){
        let isbn = $('#m-isbn').text();
        let employee_id = $('input#library-no').val();
        $.getJSON(
            "http://127.0.0.1:8080/reserve", 
            { isbn, employee_id, username, password },
            function(data){
                console.log(data);
                if(data["reply"] === "updated"){
                    $('#book-out').hide;
                    $('.modal-body').html(
                        `<p>You have booked out this book, go and collect it!</p>`
                    )
                }
            }
        );    
    });

    $(document).on('click', '#returned', function(){
        let isbn = $(this).closest('tr').find('.isbn').text();
        console.log(isbn);
        $('.modal-title').html(
            `${isbn}: Confirm Returned`
        );
        $('.modal-body').html(
            `<p><button class="btn btn-sm btn-block mt-4 text-white" id="return-confirm" type="button">Returned</button></p>` +
            `<p><button class="btn btn-sm btn-block mt-4 text-white" id="return-cancel" data-toggle="modal" data-target="#myModal" type="button">Not Returned</button></p>`
        );
    })

    $(document).on('click', '#return-confirm', function(){
        let isbn = $('.modal-title').html().substring(0, 13)
        console.log(isbn);
        //SEND A DELETE RECORD FUNCTION FOR THIS BOOK
        $.getJSON(
            "http://127.0.0.1:8080/deleteLoan", 
            { isbn, username, password },
            function(data){
                console.log(data);
                window.location.reload();
            }
        );    

    })
});
