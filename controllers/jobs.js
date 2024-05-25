const Job = require('../models/Job');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors');

const getAllJobs = async (req, res) => {
  const {userId} = req.user;
  const {company, position} = req.query;

  const queryObj = {
    createdBy: userId,
  };

  if (company) {
    queryObj.company = {$regex: company, $options: 'i'};
  }

  if (position) {
    queryObj.position = {$regex: position, $options: 'i'};
  }

  const jobs = await Job.find(queryObj).sort('createdAt');

  res.status(StatusCodes.OK).json({count: jobs.length, jobs});
};

const getJob = async (req, res) => {
  const {
    user: {userId},
    params: {id: jobId},
  } = req;
  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });

  if (!job) {
    throw new NotFoundError(`No job with ${jobId}`);
  }

  res.status(StatusCodes.OK).json(job);
};
const createJob = async (req, res) => {
  console.log(req.user);
  req.body.createdBy = req.user.userId;

  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({job});
};
const updateJob = async (req, res) => {
  const {
    body: {company, position},
    user: {userId},
    params: {id: jobId},
  } = req;

  if (!company || !position) {
    throw new BadRequestError('Company and position are required');
  }

  const job = await Job.findByIdAndUpdate(
    {
      _id: jobId,
      createdBy: userId,
    },
    req.body,
    {new: true, runValidators: true}
  );

  if (!job) {
    throw new NotFoundError(`No job with ${jobId}`);
  }
  res.status(StatusCodes.OK).json(job);
};
const deleteJob = async (req, res) => {
  const {
    user: {userId},
    params: {id: jobId},
  } = req;

  const job = await Job.findByIdAndDelete({
    _id: jobId,
    createdBy: userId,
  });

  if (!job) {
    throw new NotFoundError(`No job with ${jobId}`);
  }

  res.status(StatusCodes.NO_CONTENT).json({msg: 'deleted'});
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
