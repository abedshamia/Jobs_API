const pool = require('../db/connect');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors');

//GET ALL JOBS FOR A SPECIFIC USER
const getAllJobs = async (req, res) => {
  const createdBy = req.user.userId;
  const jobs = await pool.query('SELECT * FROM jobs WHERE createdBy = $1', [createdBy]);

  if (jobs.rowCount === 0) {
    throw new NotFoundError('No jobs found');
  }

  res.status(StatusCodes.OK).json({message: 'Jobs retrieved successfully', jobs: jobs.rows});
};

//GET A SPECIFIC JOB FOR A SPECIFIC USER
const getJob = async (req, res) => {
  const createdBy = req.user.userId;
  const id = +req.params.id;

  const job = await pool.query('SELECT * FROM jobs WHERE id = $1 AND createdBy = $2', [
    id,
    createdBy,
  ]);

  if (!job.rows[0]) {
    throw new NotFoundError('Job not found');
  }

  res.status(StatusCodes.OK).json({message: 'Job retrieved successfully', job: job.rows[0]});
};

//CREATE A NEW JOB FOR A SPECIFIC USER
const createJob = async (req, res) => {
  const {company, position} = req.body;
  const createdBy = req.user.userId;

  if (!company || !position) {
    throw new BadRequestError('Missing required fields');
  }

  const job = await pool.query(
    'INSERT INTO jobs (company, position, createdBy) VALUES ($1, $2, $3) RETURNING *',
    [company, position, createdBy]
  );

  res
    .status(StatusCodes.CREATED)
    .json({message: 'Job created successfully', job: job.rows[0]});
};

//UPDATE A SPECIFIC JOB FOR A SPECIFIC USER
const updateJob = async (req, res) => {
  const {
    body: {company, position},
    user: {userId},
    params: {id: jobId},
  } = req;

  const existedJob = await pool.query('SELECT * FROM jobs WHERE id = $1 AND createdBy = $2', [
    jobId,
    userId,
  ]);

  if (!existedJob.rows[0]) {
    throw new NotFoundError('Job not found');
  }

  if (!company || !position) {
    throw new BadRequestError('Missing required fields');
  }

  const updatedJob = {
    status: req.body.status || existedJob.rows[0].status,
  };

  const job = await pool.query(
    'UPDATE jobs SET company = $1, position = $2, status = $3 WHERE id = $4 AND createdBy = $5 RETURNING *',
    [company, position, updatedJob.status, jobId, userId]
  );

  res.status(StatusCodes.OK).json({message: 'Job updated successfully', job: job.rows[0]});
};

//DELETE A SPECIFIC JOB FOR A SPECIFIC USER
const deleteJob = async (req, res) => {
  const {
    params: {id: jobId},
    user: {userId},
  } = req;
  const job = await pool.query(
    'DELETE FROM jobs WHERE id = $1 AND createdBy = $2 RETURNING *',
    [jobId, userId]
  );

  if (!job.rows[0]) {
    throw new NotFoundError('Job not found');
  }

  res.status(StatusCodes.OK).json({message: 'Job deleted successfully'});
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
