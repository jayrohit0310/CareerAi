import { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../services/api';
import { UploadCloud, FileText, CheckCircle, ArrowRight, TrendingUp, Mic, BookOpen, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const { user, setUser } = useOutletContext();
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [skills, setSkills] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.extracted_skills) {
      setSkills(user.extracted_skills.split(','));
    }
  }, [user]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setUploadStatus('Please upload a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    setUploadStatus('');
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus(`Success: ${res.data.filename} uploaded!`);
      if (res.data.skills) {
        setSkills(res.data.skills);
        setUser(prev => ({ ...prev, extracted_skills: res.data.skills.join(',') }));
      }
    } catch (err) {
      setUploadStatus(err.response?.data?.detail || 'Failed to upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload your resume to get personalized career insights and recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Resume Upload */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-base p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Your Resume</h2>
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-1">
                {isUploading ? 'Uploading...' : 'Click to upload PDF'}
              </p>
              <p className="text-xs text-slate-500 mb-4">Max file size 5MB</p>
              
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="btn-secondary w-full"
              >
                Browse Files
              </button>
              
              {uploadStatus && (
                <div className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium ${uploadStatus.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                  {uploadStatus.includes('Success') && <CheckCircle className="w-4 h-4" />}
                  {uploadStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Predictions & Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="card-base p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">AI Career Analysis</h2>
            <p className="text-sm text-slate-500 mb-6">Based on the skills extracted from your resume.</p>
            
            {skills.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Detected Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-emerald-800 font-semibold mb-1">Career Matches Found!</h3>
                    <p className="text-emerald-600 text-sm">We've analyzed your skills and found optimal career paths.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/career-report')} 
                    className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    View Report <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-32 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-500 text-sm">
                Upload a resume to see your analysis
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard 
              icon={<TrendingUp className="w-5 h-5" />}
              title="Salary Estimator"
              description="Get an AI estimate of your market value."
              onClick={() => navigate('/results')}
              colorClass="bg-indigo-50 text-indigo-600"
            />
            <ActionCard 
              icon={<Mic className="w-5 h-5" />}
              title="Interview Prep"
              description="Practice with our AI voice interviewer."
              onClick={() => navigate('/interview')}
              colorClass="bg-purple-50 text-purple-600"
            />
            <ActionCard 
              icon={<BookOpen className="w-5 h-5" />}
              title="Courses"
              description="Find courses to fill your skill gaps."
              onClick={() => navigate('/courses')}
              colorClass="bg-amber-50 text-amber-600"
            />
            <ActionCard 
              icon={<Briefcase className="w-5 h-5" />}
              title="Job Listings"
              description="Discover tailored job opportunities."
              onClick={() => navigate('/jobs')}
              colorClass="bg-rose-50 text-rose-600"
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, onClick, colorClass }) {
  return (
    <div className="card-base p-5 flex flex-col hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group" onClick={onClick}>
      <div className={`p-2 rounded-lg w-fit mb-4 ${colorClass}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4 flex-1">{description}</p>
      <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-blue-600 transition-colors mt-auto">
        Explore <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
}
