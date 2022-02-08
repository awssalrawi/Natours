class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(queryObj);
    // console.log(req.query, queryObj);

    //*2)advanced filtering
    let queryStr = JSON.stringify(queryObj); //stringify to convert object to string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(queryStr);
    //let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //*Sorting

    if (this.queryString.sort) {
      // console.log(typeof req.query.sort);
      // mongoose do this job
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
      // sort('price ratingsAverage')
    } else {
      this.query.sort('createdAt');
    }
    return this;
  }

  //*field limiting.
  limitFields() {
    if (this.query.fields) {
      const fields = this.query.fields.split(',').join(' ');
      //console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //__v for including while -__v is for execluding
    }
    return this;
  }

  pagination() {
    //*pagination
    //page=2&limit=10  1-10 page_1  11-20 page_2  21-30 page_3
    const page = this.queryString.page * 1 || 1; //by default  it is 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
