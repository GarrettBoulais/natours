
class APIFeatures {
  constructor(query,queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // 1.a) Filtering
    const queryObj = { ...this.queryStr }; // destructure and make new Object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1.b) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, str => `$${str}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if(this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',');
      this.query = this.query.sort(sortBy.join(' '));
    } else { // otherwise put newer tours first (- does descending)
      this.query = this.query.sort('-createdAt'); 
    }
    return this;
  }

  limitFields() {
    if(this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // - excludes
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1; // default is 1
    const limit = this.queryStr.limit * 1 || 100; // default is 100
    const skip = (page - 1)* limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;