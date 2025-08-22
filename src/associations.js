const Admission = require('../src/modules/admission/admissionForm/admission.model');
const Document = require('../src/modules/admission/document/document.model');
const AdmissionCourse = require('../src/modules/admission/admissionCourse/admissionCourse.model');
const AdmissionService = require('../src/modules/admission/admissionService/admissionService.model');
const Branch = require('../src/modules/branch/branch.model');
const User = require('../src/modules/users/user.model');

Admission.hasMany(Document, { foreignKey: 'admission_id', as: 'documents' });
Document.belongsTo(Admission, { foreignKey: 'admission_id', as: 'admission' });

Admission.hasMany(AdmissionCourse, { foreignKey: 'admission_id', as: 'courses' });
AdmissionCourse.belongsTo(Admission, { foreignKey: 'admission_id', as: 'admission' });

Admission.hasMany(AdmissionService, { foreignKey: 'admission_id', as: 'services' });
AdmissionService.belongsTo(Admission, { foreignKey: 'admission_id', as: 'admission' });

Admission.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Admission.belongsTo(User, { foreignKey: 'added_by', as: 'addedBy' });

module.exports = { Admission, Document, AdmissionCourse, AdmissionService, Branch, User };
