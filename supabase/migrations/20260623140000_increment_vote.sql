create or replace function increment_vote(p_contact_id text)
returns void language sql as $$
  update votes set vote_count = vote_count + 1 where contact_id = p_contact_id;
$$;
