$(document).ready(function(){
    let username = 'SW50ZWxsaWdlbnRMaWJyYXJ5';
    let password = 'V2VsY29tZTEyMw==';
    $('#search-btn').click(function(){
       
        let search = $('#search').val();
        
        $('#search').val('');
        
        let tablebody = "";
        $.getJSON(
            "http://127.0.0.1:8080/search", 
            { search, username, password },
            function(data){
                if(data['key1'] === 'No results found'){
                    $('#search').effect('shake', 'left', 10, 6);
                    $('#search').attr('placeholder', 'No Results!').val('').focus().blur();
                }else{
                    for(let i = 0; i < Object.keys(data).length; i++){
                        let split = data[`key${i+1}`].split(' - ');
                        tablebody += '<tr>' +
                        '<th class="isbn" scope="row">' + split[0] + '</th>' +
                        '<td>' + split[1] + '</td>'
                        
                        if(split[5]==='\u0000'){
                            tablebody += '<td>N</td>';
                        }else{
                            tablebody += '<td>Y</td>';
                        }
                        tablebody += 
                        '<td align="center"><button class="btn btn-sm btn-default mt-4 text-white" data-toggle="modal" data-target="#myModal" id="more-info" type="button">...</button></td>' +
                        '</tr>';                                          
                    };
                    if(search === '') { search = 'Whole Library'}
                    $('#center').html(
                        '<div class="col-md-1">' +
                        '</div>' +
                        '<div class="col-md-10" id="center-table">' +

                        '<div class="row text-center mt-3" id="table-header">' +
                            '<div class="col-md-3">' +                            
                            '</div>' +
                            '<div class="col-md-6">' +
                                `<h1 class="h3 mb-3 font-weight-normal text-dark" id="table-title">Search Results for: ${search}</h1>` +
                            '</div>' + 
                            '<div class="col-md-3">' +
                                '<button class="btn btn-sm btn-block mt-4 text-white" id="refresh-btn" type="button" onClick="window.location.reload()">Clear Search</button> ' +
                            '</div>' +
                        '</div>' +

                        '<table class="table table-hover">' +
                            '<thead>'+
                                '<tr>' +
                                '<th scope="col">ISBN</th>' +
                                '<th scope="col">Title</th>' +
                                '<th scope="col">On Loan?</th>' +
                                '<th scope="col">More Info</th>' +
                               ' </tr>' +
                            '</thead>' +                            
                            '<tbody>' +
                                tablebody +                                
                            '</tbody>' +
                        '</table>' +
                        '</div>' +
                        '<div class="col-md-1">' +        
                        '</div>'
                    ); 
                }   
            }
        );
    });

    $('#search').keypress(function(e) {
        if(e.which == 13) {
            jQuery(this).blur();
            jQuery('#search-btn').focus().click();
            return false;
        }        
    });

    $(document).on('click', '#return-btn', function(){
        $('#center').html(
            '<div class="col-md-1">' +
            '</div>' +
            '<div class="col-md-10" id="center-table">' +

            '<div class="row text-center mt-3" id="table-header">' +
                '<div class="col-md-3">' +                            
                '</div>' +
                '<div class="col-md-6">' +
                    `<h1 class="h3 mb-3 font-weight-normal text-dark" id="table-title">Returning Books</h1>` +
                '</div>' + 
                '<div class="col-md-3">' +                    
                '</div>' +
            '</div>' + 
            
            '<div class="row text-center mt-3">' +
                '<div class="col-md-3">' +                            
                '</div>' +
                '<div class="col-md-6">' +
                    `<input id="employee-no" class="form-control mt-4" placeholder="Employee No." style="margin-bottom: 15px; background-repeat: no-repeat; background-attachment: scroll; background-size: 16px 18px; background-position: 98% 50%; cursor: auto;" type="text">` +
                    '<div class="row text-center mt-3">' +
                        '<div class="col-md-3">' +
                        '</div>' +
                        '<div class="col-md-3">' +
                            '<button class="btn btn-sm btn-block mt-4 text-white" id="id-search-btn" type="button">Enter</button> ' +
                        '</div>' +
                        '<div class="col-md-3">' +
                            '<button class="btn btn-sm btn-block mt-4 text-white" id="refresh-btn" type="button" onClick="window.location.reload()">Home</button> ' +
                        '</div>' +
                        '<div class="col-md-3">' +
                        '</div>' +
                    '</div>' +
                '</div>' + 
                '<div class="col-md-3">' +                    
                '</div>' +
            '</div>' + 

            
            '</div>' +
            '<div class="col-md-1">' +        
            '</div>'
        ); 
    })

    $(document).on('click', '#id-search-btn', function(){
        let employee_id = $('#employee-no').val();
        $('#employee-no').val('');
        console.log("hello");

        let tablebody = "";
        $.getJSON(
            "http://127.0.0.1:8080/getUser", 
            { employee_id, username, password },
            function(data){
                if(data['key1'] === 'No results found'){
                    //ENTER DATA FOR NO BOOKS ON LOAN
                }else{
                    let name = data[`key1`].split(' - ');
                    for(let i = 0; i < Object.keys(data).length; i++){
                        let split = data[`key${i+1}`].split(' - ');
                        tablebody += '<tr>' +
                        '<th class="isbn" scope="row">' + split[0] + '</th>' +
                        '<td>' + split[1] + '</td>' +
                        '<td>' + split[2].substring(0, split[2].length-2) + '</td>' +
                        '<td>' + split[3].substring(0, 15) + '</td>';
                        tablebody += 
                        '<td align="center"><button class="btn btn-sm btn-default mt-4 text-white" data-toggle="modal" data-target="#myModal" id="returned" type="button">Return</button></td>' +
                        '</tr>';   
                        
                        
                        
                    };
                    $('#center').html(
                        '<div class="col-md-1">' +
                        '</div>' +
                        '<div class="col-md-10" id="center-table">' +

                        '<div class="row text-center mt-3" id="table-header">' +
                            '<div class="col-md-3">' +                            
                            '</div>' +
                            '<div class="col-md-6">' +
                                `<h1 class="h3 mb-3 font-weight-normal text-dark" id="table-title">${name[4]} - Books On Loan</h1>` +
                            '</div>' + 
                            '<div class="col-md-3">' +    
                                '<button class="btn btn-sm btn-block mt-4 text-white" id="new-user-btn" type="button">Different user</button> ' +                            
                            '</div>' +
                        '</div>' +

                        '<table class="table table-hover">' +
                            '<thead>'+
                                '<tr>' +
                                '<th scope="col">ISBN</th>' +
                                '<th scope="col">Title</th>' +
                                '<th scope="col">Authors</th>' +
                                '<th scope="col">Return Date</th>' +
                                '<th scope="col">Return</th>' +
                               ' </tr>' +
                            '</thead>' +                            
                            '<tbody>' +
                                tablebody +                                
                            '</tbody>' +
                        '</table>' +
                        '</div>' +                        
                        '<div class="col-md-1">' +        
                        '</div>' +
                    '</div>' 
                    ); 

                }
            }
        );
    });

    $(document).on('click', '#new-user-btn', function(){
        $('#return-btn').click();
    });
});