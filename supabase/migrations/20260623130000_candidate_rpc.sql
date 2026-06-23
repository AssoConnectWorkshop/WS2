-- Adds a candidate and resets all vote counts to 0
create or replace function add_candidate(p_contact_id text)
returns void language plpgsql as $$
begin
  insert into votes (contact_id, vote_count)
  values (p_contact_id, 0)
  on conflict (contact_id) do nothing;

  update votes set vote_count = 0;
end;
$$;

-- Removes a candidate and resets all remaining vote counts to 0
create or replace function remove_candidate(p_contact_id text)
returns void language plpgsql as $$
begin
  delete from votes where contact_id = p_contact_id;
  update votes set vote_count = 0;
end;
$$;
