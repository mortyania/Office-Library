module.exports = function(Connection, Request, app){
    var config = {
        userName: 'sa',
        password: 'sa',
        server: 'localhost',
        port: 1444,
        options: {
            encrypt: false,
            database: 'LIBRARY'
        }
    };


    app.get('/search', function(req, res, next) {
        let connection = new Connection(config);
        let search = req.query.search;
        console.log(search);
        connection.on('connect', function(err){
            if(err){
                console.log(err);
            }else{
                executeStatement(connection, search, function(err, rows){
                    if (err) {
                        console.log(err);
                    } else if(Object.keys(rows).length === 0) {
                        res.json(({'key1':'No results found'}));
                    } else if (rows) {
                        res.json(rows);
                    }
                });
                
            }            
        });        
    });   
    
    app.get('/modal', function(req, res, next){
        let connection = new Connection(config);
        let isbn = req.query.isbn;
        console.log(isbn);
        connection.on('connect', function(err){
            if(err){
                console.log(err);
            }else{
                isbnSearch(connection, isbn, function(err, rows){
                    if (err) {
                        console.log(err);
                    } else if(Object.keys(rows).length === 0) {
                        res.json(({'isbn':'No results found'}));
                    } else if (rows) {
                        res.json(rows);
                    }
                });
                
            }            
        });        
    });

    app.get('/loan', function(req, res){
        let connection = new Connection(config);
        let isbn = req.query.isbn;
        console.log(isbn);
        connection.on('connect', function(err){
            if(err){
                console.log(err);
            }else{
                loanSearch(connection, isbn, function(err, rows){
                    if (err) {
                        console.log(err);
                    } else if(Object.keys(rows).length === 0) {
                        res.json(({'isbn':'No results found'}));
                    } else if (rows) {
                        res.json(rows);
                    }
                });                
            }            
        });        
    });

    app.get('/reserve', function(req, res){
        let connection = new Connection(config);
        let isbn = req.query.isbn;
        let id = req.query.employee_id;
        connection.on('connect', function(err, rows){
            if(err){
                console.log(err);
            }else{
                updateUser(connection, isbn, id, function(err, rows){
                    if (err) {
                        res.json(({'id':'No such id'}));
                    }else if(rows === 0){
                        console.log("no update");
                        res.json(({'res':'already loaning'}))
                    }else{
                        console.log('got here at least');
                        updateBook(connection, isbn, 1, function(err, rows){
                            if (err) {
                                res.json(({'id':'No results found'}));
                            } else if (rows) {
                                res.json(({'reply':'updated'}));
                            }
                        });
                    }
                });                
            }            
        });        
    });

    app.get('/getUser', function(req, res){
        let connection = new Connection(config);        
        let id = req.query.employee_id;
        connection.on('connect', function(err, rows){
            if(err){
                console.log(err);
            }else{
                getUser(connection, id, function(err, rows){
                    if (err) {
                        console.log(err);
                    } else if(Object.keys(rows).length === 0) {
                        res.json(({'isbn':'No results found'}));
                    } else if (rows) {
                        res.json(rows);
                    }
                });                
            }            
        });        
    });

    app.get('/deleteLoan', function(req, res){
        let connection = new Connection(config);
        let isbn = req.query.isbn;
        let id = req.query.employee_id;
        connection.on('connect', function(err, rows){
            if(err){
                console.log(err);
            }else{
                removeLoan(connection, isbn, function(err, rows){
                    if (err) {
                        res.json(({'id':'No such book'}));
                    }else{
                        console.log("now updating on_loan");
                        updateBook(connection, isbn, 0, function(err, rows){
                            if (err) {
                                res.json(({'id':'No results found'}));
                            } else if (rows) {
                                res.json(({'reply':'book returned'}));
                            }
                        });
                    }
                });                
            }            
        });        
    });

    function executeStatement(connection, search, callback){
        let query = "";
        let res = {};
        let rows = 0;
        console.log("test");
        if(search === ''){
            query = `SELECT DISTINCT b.isbn, b.title, `
            + `(SELECT CONCAT(a.firstname, ' ', a.lastname) + ', ' `
            + `FROM author a `
            + `WHERE a.isbn = b.isbn `
            + `ORDER BY a.isbn `
            + `FOR XML PATH(''), TYPE).value('.', 'nvarchar(MAX)') AS names, `
            + `b.date_published, p.publisher_name, b.on_loan `
            + `FROM book b `
            + `JOIN publisher p ON p.publisher_no = b.publisher_no `
            + `JOIN author au ON au.isbn = b.isbn `
            + `ORDER BY b.isbn ASC;`;
        }else{
            query = `SELECT DISTINCT b.isbn, b.title, `
            + `(SELECT CONCAT(a.firstname, ' ', a.lastname) + ', ' `
            + `FROM author a `
            + `WHERE a.isbn = b.isbn `
            + `ORDER BY a.isbn `
            + `FOR XML PATH(''), TYPE).value('.', 'nvarchar(MAX)') AS names, `
            + `b.date_published, p.publisher_name, b.on_loan `
            + `FROM book b `
            + `JOIN publisher p ON p.publisher_no = b.publisher_no `
            + `JOIN author au ON au.isbn = b.isbn `
            + `WHERE b.title LIKE '%${search}%' `
            + `OR au.firstname LIKE '%${search}%' `
            + `OR au.lastname LIKE '%${search}%' `
            + `OR p.publisher_name LIKE '%${search}%' `
            + `ORDER BY b.isbn ASC;`;
        }
        request = new Request(query, function(err, rowCount) {  
            if (err) {  
                console.log(err);
            }
            console.log(res);
            console.log(rowCount + ' rows returned');  
            callback(null, res);
        });  
        var result = "";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
                if (column.value === null) {  
                    console.log('NULL');  
                }else{  
                    result+= column.value + " - ";  
                }  
            });  
            rows += 1;
            res['key' + rows] = result;
            result = "";  
        });  

        request.on('done', function(rowCount, more) {  
            //console.log(res); 
            //console.log(rowCount + ' rows returned'); 
            
        });  
        connection.execSql(request);  
    }

    function isbnSearch(connection, search, callback){
        let query = "";
        let res = {};
        
        query = `SELECT DISTINCT b.isbn, b.title, `
            + `(SELECT CONCAT(a.firstname, ' ', a.lastname) + ', ' `
            + `FROM author a `
            + `WHERE a.isbn = b.isbn `
            + `ORDER BY a.isbn `
            + `FOR XML PATH(''), TYPE).value('.', 'nvarchar(MAX)') AS names, `
            + `b.date_published, b.on_loan, `
            + `p.publisher_name, p.city, p.country `
            + `FROM book b `
            + `JOIN publisher p ON p.publisher_no = b.publisher_no `
            + `WHERE b.isbn LIKE '%${search}%'`;

        request = new Request(query, function(err, rowCount) {  
            if (err) {  
                console.log(err);
            }
            console.log(res);
            console.log(rowCount + ' rows returned');  
            callback(null, res);
        });  
        var result = "";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
                if (column.value === null) {  
                      
                }else{  
                    result+= column.value + " - ";  
                }  
            });  
            res['isbn'] = result;
            result = "";  
        });  

        request.on('done', function(rowCount, more) {  
            //console.log(res); 
            //console.log(rowCount + ' rows returned'); 
            
        });  
        connection.execSql(request);  
    }

    function loanSearch(connection, search, callback){
        let query = "";
        let res = {};
       
        query = `SELECT b.isbn, b.on_loan, `
        + `e.employee_id, CONCAT(e.first_name, ' ', e.last_name) AS name, lb.return_date `
        + `FROM book b `        
        + `JOIN loanedbooks lb ON lb.isbn = b.isbn `
        + `JOIN employee e ON e.employee_id = lb.employee_id `
        + `WHERE b.isbn LIKE '${search}'; `;

        request = new Request(query, function(err, rowCount) {  
            if (err) {  
                console.log(err);
            }
            console.log(res);
            console.log(rowCount + ' rows returned');  
            callback(null, res);
        });  
        var result = "";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
                if (column.value === null) {  
                      
                }else{  
                    result+= column.value + " - ";  
                }  
            });  
            res['isbn'] = result;
            result = "";  
        });  

        request.on('done', function(rowCount, more) {  
             
            
        });  
        connection.execSql(request);  
    }

    function updateUser(connection, isbn, id, callback){
        let query = "";
        console.log(id);
        let currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate = currentDate.toISOString().split('T')[0];
        //currentDate = currentDate.toISOString().split('T')[0];        
        console.log(currentDate);
        console.log(isbn);
        query = `INSERT INTO loanedbooks `
            +   `VALUES ('${isbn}', '${id}', '${currentDate}');`            

        request = new Request(query, function(err, rows) {  
            if (err) {  
                console.log(err);
                callback(err, null);
            }else{
                console.log(rows);
                callback(null, rows);
            }
            
        });  
        
        connection.execSql(request);  
    }

    function updateBook(connection, isbn, value, callback, query){
        query = "";
        console.log(value);
        query = `UPDATE b ` +
                `SET b.on_loan = ${value} ` +
                `FROM book b ` +
                `WHERE b.isbn = '${isbn}';`

        request = new Request(query, function(err) {  
            if (err) {  
                console.log(err);
            }
            callback(null, "done");
        });
        connection.execSql(request);  
    }

    function getUser(connection, id, callback, query){
        query = '';
        let res = {};
        let rows = 0;

        query = `SELECT DISTINCT b.isbn, b.title, ` + 
                    `(SELECT CONCAT(a.firstname, ' ', a.lastname) + ', ' ` +
                    `FROM author a ` +
                    `WHERE a.isbn = b.isbn ` +
                    `ORDER BY a.isbn ` +
                    `FOR XML PATH(''), TYPE).value('.', 'nvarchar(MAX)') AS names, ` +
                `lb.return_date, CONCAT(e.first_name, ' ', e.last_name) ` +
                `FROM book b ` +
                `JOIN LoanedBooks lb ON b.isbn = lb.isbn ` +
                `JOIN Employee e ON lb.employee_id = e.employee_id ` +
                `WHERE e.employee_id LIKE ${id}`;
        
        request = new Request(query, function(err, rowCount) {  
            if (err) {  
                console.log(err);
            }
            console.log(res);
            console.log(rowCount + ' rows returned');  
            callback(null, res);
        });  
        var result = "";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
                if (column.value === null) {  
                    console.log('NULL');  
                }else{  
                    result+= column.value + " - ";  
                }  
            });  
            rows += 1;
            res['key' + rows] = result;
            result = "";  
        });  
        
        request.on('done', function(rowCount, more) {  
            //console.log(res); 
            //console.log(rowCount + ' rows returned'); 
                    
        });  
        connection.execSql(request);  
    }

    function removeLoan(connection, isbn, callback, query){
        query = "";

        query = `DELETE FROM loanedbooks ` +
                `WHERE isbn = '${isbn}'`

        request = new Request(query, function(err) {  
            if (err) {  
                console.log(err);
            }
            callback(null, "done");
        });
        connection.execSql(request);  
    }
}
