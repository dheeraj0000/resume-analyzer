import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export async function uploadResume(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await axios.post(API_BASE + '/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
  return res.data;
}

export async function getHistory() {
  const res = await axios.get(API_BASE + '/history');
  return res.data;
}

export async function getResume(id) {
  const res = await axios.get(API_BASE + '/resume/' + id);
  return res.data;
}
