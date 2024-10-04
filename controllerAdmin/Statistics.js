const getAccessStatistics = `
SELECT 
    u.name AS user_name,
    p.name AS project_name,
    up.lastAccessed AS last_access_time,
    up.access AS access_type,
    COUNT(up.access) AS project_access_count
FROM 
    user u
JOIN 
    user_has_project up ON u.idUser = up.user_idUser
JOIN 
    project p ON up.project_idProject = p.idProject
GROUP BY 
    u.name, p.name, up.lastAccessed, up.access
ORDER BY 
    up.lastAccessed DESC;
`;

const countAcceessCount = `
 SELECT 
      u.name AS user_name,
      p.name AS project_name,
      SUM(up.accessCount) AS total_access_count
    FROM 
      user u
    JOIN 
      user_has_project up ON u.idUser = up.user_idUser
    JOIN 
      project p ON up.project_idProject = p.idProject
    GROUP BY 
      u.idUser, p.idProject
    ORDER BY 
      total_access_count DESC;
`;

export { getAccessStatistics, countAcceessCount };
