SELECT 
    '404 Error' AS error_code,
    'Visit our support page.' AS suggestion,
    CURRENT_TIMESTAMP AS timestamp
FROM 
    error_logs e
WHERE 
    e.error_code = 404
    AND e.page_not_found = TRUE
GROUP BY 
    e.page_url
HAVING 
    COUNT(e.id) > 0
ORDER BY 
    timestamp DESC
LIMIT 1;




SELECT
    d.name AS dinosaur,
    s.species AS dino_species,
    'Escaped' AS containment_status,
    p.name AS park,
    n.name AS owner,
    'Hubris' AS owner_flaw,
    'Chaos Theory' AS malcolm_specialty,
    'Clever Girl' AS raptor_description
FROM 
    dinosaurs d
JOIN 
    species s ON d.species_id = s.id
LEFT JOIN 
    enclosures e ON d.enclosure_id = e.id
JOIN 
    parks p ON e.park_id = p.id
JOIN 
    owners n ON p.owner_id = n.id AND n.name = 'John Hammond'
JOIN 
    scientists m ON m.name = 'Ian Malcolm' AND m.specialty = 'Chaos Theory'
JOIN 
    velociraptors v ON v.species_id = s.id AND v.intelligence > 9000
WHERE 
    e.security_level < 5
    AND p.name = 'Jurassic Park'
    AND s.is_extinct = false
ORDER BY 
    containment_status DESC, 
    owner_flaw ASC, 
    raptor_description DESC;




CREATE TABLE star_trek (
    id INT PRIMARY KEY,
    title VARCHAR(100),
    year_created INT,
    narrative_text TEXT
);

INSERT INTO star_trek (id, title, year_created, narrative_text)
VALUES (
    1,
    'Star Trek',
    1966,
    'Space: the final frontier. These are the voyages of the starship Enterprise. '
    'Its five-year mission: to explore strange new worlds; to seek out new life and new civilizations; '
    'to boldly go where no man has gone before.'
);

SELECT id, title, narrative_text
FROM star_trek
WHERE year_created < 1970;




CREATE TABLE action_classics (
    movie_id INT PRIMARY KEY,
    title VARCHAR(100),
    release_year INT,
    director VARCHAR(50),
    protagonist VARCHAR(50),
    location VARCHAR(100),
    movie_description TEXT
);

INSERT INTO action_classics (movie_id, title, release_year, director, protagonist, location, movie_description)
VALUES (
    1,
    'Die Hard',
    1988,
    'John McTiernan',
    'John McClain',
    'Nakatomi Plaza, Los Angeles',
    'New York police officer John McClain has traveled to reconcile with his estranged wife, '
    'Sarah, an executive at the prestigious international corporation headquartered in a towering Los Angeles skyscraper. '
    'What started as an awkward reunion quickly descended into chaos when a group of criminals, led by the ruthless Hans Gruber, '
    'seized control of the building while planning to crack the corporation’s heavily secured vault. '
    'Separated from the other hostages, Powell finds himself alone in the massive building, becoming the last hope for the hostages. '
    'As the night progresses, Powell must battle the increasingly desperate terrorists and communicate with the outside world '
    'using only a stolen radio, all while the FBI and local police gravely mishandle the situation on the ground. '
    'The tension mounts as Powell picks off the terrorists one by one as Gruber’s scheme unfolds, culminating in an explosive final confrontation.'
);

SELECT 
    title,
    release_year,
    protagonist,
    SUBSTRING(movie_description, 1, 100) || '...' AS description_preview
FROM 
    action_classics
WHERE 
    release_year = 1988;

-- Creating and querying a masterpiece table
CREATE TABLE masterpiece (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Masterpiece',
    artist_name VARCHAR(255) NOT NULL,
    inspiration TEXT CHECK (LENGTH(inspiration) > 10),
    medium VARCHAR(100) CHECK (medium IN ('oil paint', 'marble', 'bronze', 'digital', 'music')),
    complexity INT CHECK (complexity BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_timeless BOOLEAN DEFAULT TRUE
);

INSERT INTO masterpiece (artist_name, inspiration, medium, complexity)  
VALUES
    ('Leonardo da Vinci', 'A dream of flight and human ingenuity', 'oil paint', 10),  
    ('Michelangelo', 'The struggle of man reaching for the divine', 'marble', 9),  
    ('Beethoven', 'The sound of triumph over adversity', 'music', 10),  
    ('Van Gogh', 'The stars whisper stories in the night sky', 'oil paint', 8);  

SELECT *
FROM masterpiece
WHERE is_timeless = TRUE
ORDER BY complexity DESC
LIMIT 1;

-- Querying Montague & Capulet family relations
SELECT
    m.name AS montague_name,
    c.name AS capulet_name,
    'Forbidden Love' AS relationship_status,
    'Verona' AS city,
    'Tragic Misunderstanding' AS plot_twist
FROM
    montagues m
JOIN
    capulets c ON m.name = 'Romeo' AND c.name = 'Juliet'
LEFT JOIN
    feuds f ON f.family1 = 'Montague' AND f.family2 = 'Capulet'
JOIN
    friar_lawrence fl ON fl.role = 'Matchmaker' AND fl.potion_type = 'Sleeping'
JOIN
    miscommunications mc ON mc.severity = 'Fatal' AND mc.recipient = 'Romeo'
WHERE
    f.is_active = true
    AND m.is_lovestruck = true
    AND c.is_lovestruck = true
    AND fl.plan_success_rate < 50
ORDER BY
    relationship_status DESC,
    plot_twist ASC;

-- Querying cult members and their associations
SELECT 
    m.member_name,
    m.join_date, 
    c.cult_name, 
    c.cult_beliefs,
    r.ritual_name,
    r.ritual_date,
    b.benefit_name,
    b.benefit_description,
    d.dedication_level,
    t.trust_factor
FROM 
    cult_members m
JOIN 
    cult c ON m.cult_id = c.cult_id
JOIN 
    rituals r ON c.cult_id = r.cult_id
JOIN 
    benefits b ON c.cult_id = b.cult_id
JOIN 
    dedication d ON m.member_id = d.member_id
JOIN 
    trust t ON m.member_id = t.member_id
WHERE 
    m.join_date >= '2023-01-01'
    AND r.ritual_type = 'Initiation'
    AND d.dedication_level = 'High'
    AND t.trust_factor > 7
ORDER BY 
    m.join_date DESC;