class ApiFearutes {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = Object.assign({}, this.queryString);

    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced Filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt'); // default sort
    }
    return this;
  }

  project() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // exclude __v field
    }
    return this;
  }

  pagination() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFearutes;
