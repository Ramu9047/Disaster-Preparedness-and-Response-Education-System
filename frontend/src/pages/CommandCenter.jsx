import { useAuth, ROLES } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import OfficerDashboard from './dashboards/OfficerDashboard';
import RescueDashboard from './dashboards/RescueDashboard';
import CitizenDashboard from './dashboards/CitizenDashboard';
import VolunteerDashboard from './dashboards/VolunteerDashboard';

export default function CommandCenter() {
    const { user } = useAuth();
    if (!user) return null;

    switch (user.role) {
        case ROLES.ADMIN:     return <AdminDashboard />;
        case ROLES.OFFICER:   return <OfficerDashboard />;
        case ROLES.RESCUE:    return <RescueDashboard />;
        case ROLES.VOLUNTEER: return <VolunteerDashboard />;
        default:              return <CitizenDashboard />;
    }
}
