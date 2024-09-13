class APIFeatures {
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr ; 
    }

    search(){
        //si il n'existe pas => empty object : {}
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex: this.queryStr.keyword,
                // 'i' pour ne pas le rendre sensible à la casse
                $options:'i'
            }
        } : {}
        

        this.query = this.query.find({ ...keyword});
        return this;
    }

    filter(){
        const queryCopy = { ...this.queryStr };

        //console.log(queryCopy); 
       // console.log('Query Copy:', queryCopy);
        //Suppression des champs depuis query
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach(el => delete queryCopy[el]);

        //Advanced filter for price, ratings ...
        //gte greater then mongoose operator lte = less then
        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resPerPage){
        //gestion de la page et affichage des produits : rule is simple juste print 1/3 of our products and pagination will print the rest
        const currentPage = Number(this.queryStr.page) || 1 ;
        const skip = resPerPage * (currentPage - 1);

        //limit of doc who re returned
        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }

    
}
module.exports = APIFeatures